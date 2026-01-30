"use client";

import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { ApiResponseSchema, TelemetrySchema } from "@/lib/domain/types";
import type { Telemetry } from "@/lib/domain/types";
import * as Sentry from "@sentry/nextjs";

interface UseTelemetryPollingOptions {
  scope?: "fleet" | "drone" | "map";
  droneId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

// Track last error time for deduplication
let lastErrorReportedAt = 0;
const ERROR_REPORT_INTERVAL_MS = 30000; // Only report errors every 30 seconds

export function useTelemetryPolling(options: UseTelemetryPollingOptions = {}) {
  // Production default: 2s polling (was 1s)
  const { scope = "fleet", droneId, enabled = true, refetchInterval = 2000 } = options;

  const queryClient = useQueryClient();

  // Store latest telemetry in ref to avoid rerenders
  const latestTelemetryRef = useRef<Telemetry[]>([]);
  const lastUpdateTimeRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const throttleMs = 250; // Update map at most every 250ms

  // Track previous activeMissionId per drone for transition detection
  const previousActiveMissionIdsRef = useRef<Map<string, string | null>>(new Map());
  // Track lastMissionId per drone when activeMissionId is present
  const lastMissionIdsRef = useRef<Map<string, string>>(new Map());

  const queryParams: Record<string, string> = {};
  if (scope === "drone" && droneId) {
    queryParams.droneId = droneId;
  } else if (scope === "map") {
    queryParams.scope = "map";
  } else if (scope === "fleet") {
    queryParams.scope = "fleet";
  }

  // Report error to Sentry with deduplication
  const reportError = useCallback(
    (error: unknown) => {
      const now = Date.now();
      if (now - lastErrorReportedAt < ERROR_REPORT_INTERVAL_MS) {
        return; // Skip if we recently reported an error
      }
      lastErrorReportedAt = now;

      Sentry.captureException(error, {
        tags: {
          component: "useTelemetryPolling",
          scope,
          droneId: droneId || "fleet",
        },
        extra: {
          consecutiveErrors: consecutiveErrorsRef.current,
        },
      });
    },
    [scope, droneId]
  );

  const query = useQuery({
    queryKey: ["telemetry", scope, droneId],
    queryFn: async () => {
      try {
        const result = await apiGet(
          "/api/telemetry",
          ApiResponseSchema(TelemetrySchema.array()),
          queryParams
        );
        // Reset error counter on success
        consecutiveErrorsRef.current = 0;
        return result;
      } catch (error) {
        // Handle connection refused and network errors gracefully
        if (error instanceof Error) {
          const isConnectionError =
            error.message.includes("ERR_CONNECTION_REFUSED") ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("network");

          if (isConnectionError) {
            // Create a more user-friendly error
            const connectionError = new Error(
              "Cannot connect to server. Please ensure the dev server is running."
            );
            connectionError.name = "ConnectionError";
            throw connectionError;
          }
        }
        throw error;
      }
    },
    enabled,
    refetchInterval:
      typeof window !== "undefined" && document.hidden
        ? refetchInterval * 3
        : refetchInterval, // Increase interval when tab is inactive
    refetchOnWindowFocus: false,
    staleTime: 1000, // Increased from 0 for better caching
    // Keep previous data on error/refetch to prevent UI from breaking
    placeholderData: keepPreviousData,
    // Bounded retry with exponential backoff (reduced retries for faster failure detection)
    retry: (failureCount, error) => {
      // Don't retry on connection errors (server is down)
      if (error instanceof Error && error.name === "ConnectionError") {
        return false;
      }
      return failureCount < 2; // Reduced from 3 to 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Reduced max delay
    // Don't spam the console with errors
    meta: {
      errorMessage: "Telemetry fetch failed",
    },
  });

  // Track consecutive errors
  useEffect(() => {
    if (query.isError) {
      consecutiveErrorsRef.current += 1;
      // Only report to Sentry after multiple consecutive failures
      if (consecutiveErrorsRef.current >= 3) {
        reportError(query.error);
      }
    }
  }, [query.isError, query.error, reportError]);

  // Track transition detection throttle to avoid excessive checks
  const transitionCheckThrottleRef = useRef<number>(0);
  const TRANSITION_CHECK_INTERVAL_MS = 5000; // Check at most once per 5 seconds (reduced frequency)

  // Update ref when data changes and detect mission status transitions
  useEffect(() => {
    if (query.data?.data) {
      const now = Date.now();
      // Throttle: only update if enough time has passed
      if (now - lastUpdateTimeRef.current >= throttleMs) {
        latestTelemetryRef.current = query.data.data;
        lastUpdateTimeRef.current = now;
      } else {
        // Still update ref, but mark for delayed update
        latestTelemetryRef.current = query.data.data;
      }

      // Detect mission status transitions using telemetry data (no extra fetches)
      // Throttle transition checks to avoid excessive invalidations
      if (now - transitionCheckThrottleRef.current < TRANSITION_CHECK_INTERVAL_MS) {
        return; // Skip check if too soon
      }
      transitionCheckThrottleRef.current = now;

      // For map/fleet scope, detect transitions from telemetry data itself
      if (scope === "map" || scope === "fleet") {
        query.data.data.forEach((telemetry) => {
          const previousMissionId = previousActiveMissionIdsRef.current.get(telemetry.droneId);
          const currentMissionId = telemetry.activeMissionId ?? null;
          
          // Initialize tracking for new drones
          if (previousMissionId === undefined) {
            previousActiveMissionIdsRef.current.set(telemetry.droneId, currentMissionId);
            if (currentMissionId) {
              lastMissionIdsRef.current.set(telemetry.droneId, currentMissionId);
            }
            return;
          }
          
          // Detect transition: mission cleared (completed/failed/cancelled)
          if (previousMissionId !== null && currentMissionId === null) {
            const lastMissionId = lastMissionIdsRef.current.get(telemetry.droneId);
            // Mission was cleared - invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["missions"] });
            queryClient.invalidateQueries({ queryKey: ["active-mission", telemetry.droneId] });
            if (lastMissionId) {
              queryClient.invalidateQueries({ queryKey: ["mission", lastMissionId] });
            }
            queryClient.invalidateQueries({ queryKey: ["drone", telemetry.droneId] });
            // Clear lastMissionId tracking
            lastMissionIdsRef.current.delete(telemetry.droneId);
          }
          
          // Update tracking
          previousActiveMissionIdsRef.current.set(telemetry.droneId, currentMissionId);
          // Track lastMissionId when activeMissionId is present
          if (currentMissionId) {
            lastMissionIdsRef.current.set(telemetry.droneId, currentMissionId);
          }
        });
      } else if (scope === "drone" && droneId) {
        // For single drone scope, use telemetry data directly
        const telemetryEntry = query.data.data.find((t) => t.droneId === droneId);
        if (!telemetryEntry) return;
        
        const previousMissionId = previousActiveMissionIdsRef.current.get(droneId);
        const currentMissionId = telemetryEntry.activeMissionId ?? null;
        
        // Initialize if needed
        if (previousMissionId === undefined) {
          previousActiveMissionIdsRef.current.set(droneId, currentMissionId);
          if (currentMissionId) {
            lastMissionIdsRef.current.set(droneId, currentMissionId);
          }
          return;
        }
        
        // Detect transition: mission cleared
        if (previousMissionId !== null && currentMissionId === null) {
          const lastMissionId = lastMissionIdsRef.current.get(droneId);
          // Mission was cleared - invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ["missions"] });
          queryClient.invalidateQueries({ queryKey: ["active-mission", droneId] });
          if (lastMissionId) {
            queryClient.invalidateQueries({ queryKey: ["mission", lastMissionId] });
          }
          queryClient.invalidateQueries({ queryKey: ["drone", droneId] });
          // Clear lastMissionId tracking
          lastMissionIdsRef.current.delete(droneId);
        }
        
        // Update tracking
        previousActiveMissionIdsRef.current.set(droneId, currentMissionId);
        // Track lastMissionId when activeMissionId is present
        if (currentMissionId) {
          lastMissionIdsRef.current.set(droneId, currentMissionId);
        }
      }
    }
  }, [query.data, scope, droneId, queryClient]);

  // Get throttled telemetry (for map updates)
  const getThrottledTelemetry = (): Telemetry[] => {
    const now = Date.now();
    if (now - lastUpdateTimeRef.current >= throttleMs) {
      lastUpdateTimeRef.current = now;
      return latestTelemetryRef.current;
    }
    return latestTelemetryRef.current;
  };

  // Compute if data is stale (error occurred but we have previous data)
  const isStale = query.isError && latestTelemetryRef.current.length > 0;
  const hasData = (query.data?.data?.length ?? 0) > 0 || latestTelemetryRef.current.length > 0;

  return {
    telemetry: query.data?.data ?? latestTelemetryRef.current,
    throttledTelemetry: latestTelemetryRef.current,
    getThrottledTelemetry,
    isLoading: query.isLoading && !hasData,
    isError: query.isError && !hasData, // Only show error if we have no data at all
    isStale, // New: indicates we're showing stale data
    error: query.error,
    refetch: query.refetch,
    consecutiveErrors: consecutiveErrorsRef.current,
  };
}

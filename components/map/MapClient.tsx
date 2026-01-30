"use client";

import { useEffect } from "react";
import { useTelemetryPolling } from "@/hooks/data/useTelemetryPolling";
import { useActiveMission } from "@/hooks/data/useActiveMission";
import { useGlobalUIStore } from "@/lib/stores/ui/globalUiStore";
import { useMapUIStore } from "@/lib/stores/ui/mapUiStore";
import { MapControls } from "./MapControls";
import { MapLegend } from "./MapLegend";
import { TelemetryPanel } from "./TelemetryPanel";
import { AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import { MapCanvas } from "./MapCanvas";
import type { Telemetry } from "@/lib/domain/types";

interface MapClientProps {
  mapboxToken: string;
  initialSelectedDroneId?: string | null;
}

export function MapClient({ mapboxToken, initialSelectedDroneId }: MapClientProps) {
  const setGlobalSelectedDroneId = useGlobalUIStore((state) => state.setSelectedDroneId);
  const globalSelectedDroneId = useGlobalUIStore((state) => state.selectedDroneId);
  const { openDronePanel, setPanelOpen, selectedDroneId: mapSelectedDroneId, followMode } = useMapUIStore();

  // Use either global or map-specific selected drone ID
  const effectiveSelectedDroneId = globalSelectedDroneId || mapSelectedDroneId;

  // Tiered polling: 5s when no selection, 2s when selected/following
  const baseInterval = effectiveSelectedDroneId || followMode ? 2000 : 5000;
  const isHidden = typeof window !== "undefined" && document.hidden;
  const refetchInterval = isHidden ? baseInterval * 3 : baseInterval;

  // Production-optimized: adaptive polling based on selection/follow mode
  // Use scope="map" to get mission fields for transition detection without extra fetches
  const { telemetry, isLoading, isError, isStale, error, refetch } = useTelemetryPolling({
    scope: "map",
    enabled: true,
    refetchInterval,
  });

  // Fetch active mission for selected drone (only when drone is selected)
  const { data: activeMission } = useActiveMission(effectiveSelectedDroneId || null);

  // Initialize selected drone from URL param
  useEffect(() => {
    if (initialSelectedDroneId) {
      setGlobalSelectedDroneId(initialSelectedDroneId);
      openDronePanel(initialSelectedDroneId);
      setPanelOpen(true);
    }
  }, [initialSelectedDroneId, setGlobalSelectedDroneId, openDronePanel, setPanelOpen]);

  // Log errors for debugging
  useEffect(() => {
    if (isError && error) {
      logger.error("Telemetry polling error:", error);
      if (error instanceof Error) {
        logger.error("Error message:", error.message);
        logger.error("Error stack:", error.stack);
      }
    }
  }, [isError, error]);

  // Center to fleet function (fitBounds)
  const centerToFleet = () => {
    if (telemetry.length === 0) return;

    const lats = telemetry.map((t: Telemetry) => t.position.lat);
    const lngs = telemetry.map((t: Telemetry) => t.position.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    window.dispatchEvent(
      new CustomEvent("map-fit-bounds", {
        detail: {
          bounds: [
            [minLng, minLat],
            [maxLng, maxLat],
          ] as [[number, number], [number, number]],
        },
      })
    );
  };

  // Check if token is valid
  const hasValidToken =
    mapboxToken && mapboxToken.trim().length > 0 && mapboxToken.startsWith("pk.");

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
      style={{ height: "100%" }}
    >
      {/* Token Error */}
      {!hasValidToken && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
          <div className="max-w-md space-y-4 rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Mapbox token missing
            </h3>
            <div className="space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <p>To enable the map view:</p>
              <ol className="ml-2 list-inside list-decimal space-y-1">
                <li>
                  Create or edit{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-700">.env.local</code> in
                  the project root
                </li>
                <li>
                  Add:{" "}
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-700">
                    NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
                  </code>
                </li>
                <li>
                  Restart the dev server (
                  <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-700">npm run dev</code>)
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Stale Data Banner - non-blocking warning */}
      {isStale && hasValidToken && (
        <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700 shadow-lg dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <AlertCircle size={16} />
          <span>Connection issue - showing last known data</span>
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:text-yellow-800 dark:hover:text-yellow-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Error Banner - only shown if no data at all */}
      {isError && hasValidToken && (
        <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-lg dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle size={16} />
          <span>Error: {error instanceof Error ? error.message : "Failed to fetch telemetry"}</span>
          <button
            onClick={() => refetch()}
            className="ml-2 underline hover:text-red-800 dark:hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && telemetry.length === 0 && hasValidToken && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">No active drones</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              There are no drones currently online or in mission.
            </p>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      {hasValidToken && (
        <MapCanvas telemetry={telemetry} mapboxToken={mapboxToken} activeMission={activeMission ?? null} />
      )}

      {/* Controls */}
      {hasValidToken && <MapControls onCenterFleet={centerToFleet} />}

      {/* Legend */}
      {hasValidToken && <MapLegend />}

      {/* Telemetry Panel */}
      {hasValidToken && <TelemetryPanel telemetry={telemetry} />}
    </div>
  );
}

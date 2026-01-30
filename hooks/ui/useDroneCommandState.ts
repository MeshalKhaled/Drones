"use client";

import { useQuery } from "@tanstack/react-query";
import type { DroneCommand } from "@/lib/stores/drone-store";
import type { DroneStatus } from "@/lib/domain/types";

/**
 * Runtime state returned by the API
 */
interface DroneRuntimeStateResponse {
  status: DroneStatus;
  armed: boolean;
  returning: boolean;
  lastCommand: DroneCommand | null;
  lastCommandAt: string | null;
  targetAltitude: number | null;
}

/**
 * Availability info for a single command
 */
export interface CommandAvailability {
  enabled: boolean;
  reason: string | null;
}

/**
 * All command availability info
 */
export interface CommandAvailabilityMap {
  ARM: CommandAvailability;
  TAKEOFF: CommandAvailability;
  LAND: CommandAvailability;
  RTL: CommandAvailability;
}

/**
 * User-friendly error messages for command error codes
 */
export const commandErrorMessages: Record<string, string> = {
  NOT_FOUND: "Drone not found",
  NOT_ARMED: "Drone must be armed before takeoff",
  COMMAND_FAILED: "Command failed to execute. Please try again.",
  VALIDATION_ERROR: "Invalid command",
  INTERNAL_ERROR: "An unexpected error occurred",
};

/**
 * Get user-friendly message for an error code
 */
export function getCommandErrorMessage(code: string): string {
  return commandErrorMessages[code] || "Command failed";
}

/**
 * Calculate command availability based on drone state
 */
function calculateCommandAvailability(
  state: DroneRuntimeStateResponse | null
): CommandAvailabilityMap {
  if (!state) {
    return {
      ARM: { enabled: false, reason: "Drone state unavailable" },
      TAKEOFF: { enabled: false, reason: "Drone state unavailable" },
      LAND: { enabled: false, reason: "Drone state unavailable" },
      RTL: { enabled: false, reason: "Drone state unavailable" },
    };
  }

  const { status, armed, returning } = state;

  return {
    ARM: {
      enabled: !armed,
      reason: armed ? "Drone is already armed" : null,
    },
    TAKEOFF: {
      enabled: armed && status === "online",
      reason: !armed
        ? "Drone must be armed first"
        : status !== "online"
          ? `Cannot takeoff while ${status === "in-mission" ? "in mission" : status}`
          : null,
    },
    LAND: {
      enabled: status === "in-mission" && !returning,
      reason:
        status !== "in-mission"
          ? "Drone must be in mission to land"
          : returning
            ? "Drone is already returning to launch"
            : null,
    },
    RTL: {
      enabled: status === "in-mission" && !returning,
      reason:
        status !== "in-mission"
          ? "Drone must be in mission to return"
          : returning
            ? "Drone is already returning to launch"
            : null,
    },
  };
}

/**
 * Hook to fetch and poll drone command state
 */
export function useDroneCommandState(droneId: string) {
  const query = useQuery<DroneRuntimeStateResponse>({
    queryKey: ["drone-command-state", droneId],
    queryFn: async () => {
      const response = await fetch(`/api/drones/${droneId}/state`);
      if (!response.ok) {
        throw new Error("Failed to fetch drone state");
      }
      const json = await response.json();
      return json.data;
    },
    refetchInterval: 2000, // Poll every 2 seconds
    staleTime: 1000, // Consider data stale after 1 second
  });

  const commandAvailability = calculateCommandAvailability(query.data ?? null);

  return {
    ...query,
    commandAvailability,
    droneState: query.data ?? null,
  };
}

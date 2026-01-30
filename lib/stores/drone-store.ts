/**
 * Canonical drone runtime state store
 *
 * This is the SINGLE SOURCE OF TRUTH for all drone runtime state.
 * Static profile data (name, model, flightHours baseline) remains in mockDrones.
 * All runtime state (status, battery, commands, position) lives here.
 */

import type { DroneStatus } from "@/lib/domain/types";
import { mockDrones } from "@/services/mock-data";

export type DroneCommand = "ARM" | "TAKEOFF" | "LAND" | "RTL";

/**
 * Runtime state for a drone (changes over time)
 */
export interface DroneRuntimeState {
  // Status and command state
  status: DroneStatus;
  armed: boolean;
  returning: boolean;
  lastCommand: DroneCommand | null;
  lastCommandAt: string | null;

  // Mission execution
  activeMissionId: string | null;

  // Position and movement
  position: {
    lat: number;
    lng: number;
    alt: number;
    speed: number;
  };

  // Battery (updated by simulation)
  batteryPct: number;

  // Command targets
  targetAltitude: number | null;

  // Base anchor (for RTL)
  baseAnchor: {
    lat: number;
    lng: number;
  };

  // Offline tracking (for timeout detection)
  offlineSince: string | null;

  // Last update timestamp
  updatedAt: string;
}

/**
 * Static profile data (doesn't change)
 */
export interface DroneProfile {
  id: string;
  name: string;
  flightHours: number; // Baseline flight hours
  lastMission: string | null;
  health: {
    signalStrength: number;
    gpsQuality: number;
    motorHealth: number;
    overall: number;
  };
}

/**
 * Combined drone data (profile + runtime state)
 */
export interface DroneWithState {
  profile: DroneProfile;
  runtime: DroneRuntimeState;
}

declare global {
  // eslint-disable-next-line no-var
  var __droneDashboardRuntimeStateStore: Map<string, DroneRuntimeState> | undefined;
}

type GlobalWithDroneRuntimeStore = typeof globalThis & {
  __droneDashboardRuntimeStateStore?: Map<string, DroneRuntimeState>;
};

// Runtime state store (keyed by droneId) - stored on globalThis to survive dev HMR
const runtimeStateStore: Map<string, DroneRuntimeState> = (() => {
  const g = globalThis as GlobalWithDroneRuntimeStore;
  if (!g.__droneDashboardRuntimeStateStore) {
    g.__droneDashboardRuntimeStateStore = new Map<string, DroneRuntimeState>();
  }
  return g.__droneDashboardRuntimeStateStore;
})();

/**
 * Initialize runtime state for all drones from mockDrones baseline
 */
function initializeRuntimeState(): void {
  mockDrones.forEach((drone) => {
    if (!runtimeStateStore.has(drone.id)) {
      runtimeStateStore.set(drone.id, {
        status: drone.status,
        armed: drone.status === "in-mission", // Drones in-mission should be armed
        returning: false,
        lastCommand: null,
        lastCommandAt: null,
        activeMissionId: null, // Will be linked later by linkDronesWithActiveMissions
        position: { ...drone.position },
        batteryPct: drone.batteryPct,
        targetAltitude: null,
        baseAnchor: {
          lat: drone.position.lat,
          lng: drone.position.lng,
        },
        offlineSince: drone.status === "offline" ? drone.updatedAt : null,
        updatedAt: drone.updatedAt,
      });
    }
  });
}

/**
 * Link drones with their active missions (for "in-mission" drones)
 * This must be called after mission-store is initialized
 */
export function linkDronesWithActiveMissions(): void {
  // Lazy import to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getActiveMissionForDrone } = require("./mission-store");

  runtimeStateStore.forEach((state, droneId) => {
    if (state.status === "in-mission" && !state.activeMissionId) {
      const activeMission = getActiveMissionForDrone(droneId);
      if (activeMission) {
        runtimeStateStore.set(droneId, {
          ...state,
          activeMissionId: activeMission.id,
          armed: true,
        });
      }
    }
  });
}

// Initialize on module load (idempotent)
initializeRuntimeState();

/**
 * Get static profile for a drone
 */
export function getDroneProfile(droneId: string): DroneProfile | null {
  const drone = mockDrones.find((d) => d.id === droneId);
  if (!drone) return null;

  return {
    id: drone.id,
    name: drone.name,
    flightHours: drone.flightHours,
    lastMission: drone.lastMission,
    health: { ...drone.health },
  };
}

/**
 * List all drone profiles
 */
export function listDroneProfiles(): DroneProfile[] {
  return mockDrones.map((drone) => ({
    id: drone.id,
    name: drone.name,
    flightHours: drone.flightHours,
    lastMission: drone.lastMission,
    health: { ...drone.health },
  }));
}

/**
 * Get runtime state for a drone
 */
export function getDroneRuntimeState(droneId: string): DroneRuntimeState | null {
  return runtimeStateStore.get(droneId) || null;
}

/**
 * List all runtime states
 */
export function listDroneRuntimeStates(): Map<string, DroneRuntimeState> {
  return new Map(runtimeStateStore);
}

/**
 * Get combined profile + runtime state
 */
export function getDroneWithState(droneId: string): DroneWithState | null {
  const profile = getDroneProfile(droneId);
  const runtime = getDroneRuntimeState(droneId);

  if (!profile || !runtime) return null;

  return { profile, runtime };
}

/**
 * List all drones with combined state
 */
export function listDronesWithState(): DroneWithState[] {
  return mockDrones
    .map((drone) => {
      const runtime = runtimeStateStore.get(drone.id);
      if (!runtime) return null;

      return {
        profile: {
          id: drone.id,
          name: drone.name,
          flightHours: drone.flightHours,
          lastMission: drone.lastMission,
          health: { ...drone.health },
        },
        runtime,
      };
    })
    .filter((d): d is DroneWithState => d !== null);
}

/**
 * Apply a command to a drone (updates runtime state)
 */
export function applyCommand(
  droneId: string,
  command: DroneCommand
): {
  success: boolean;
  error?: { code: string; message: string };
  newState?: DroneRuntimeState;
} {
  const runtime = runtimeStateStore.get(droneId);
  if (!runtime) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Drone not found" },
    };
  }

  let newStatus: DroneStatus = runtime.status;
  let newArmed = runtime.armed;
  let newReturning = runtime.returning;
  let newTargetAltitude: number | null = runtime.targetAltitude;

  // State transitions based on command
  switch (command) {
    case "ARM":
      if (runtime.status === "offline" || runtime.status === "charging") {
        newStatus = "online";
      }
      newArmed = true;
      newReturning = false;
      newTargetAltitude = null;
      break;
    case "TAKEOFF":
      if (!runtime.armed) {
        return {
          success: false,
          error: { code: "NOT_ARMED", message: "Drone must be armed before takeoff" },
        };
      }
      if (runtime.status === "online") {
        newStatus = "in-mission";
        newTargetAltitude = 30 + Math.random() * 50; // 30-80m
        newReturning = false;
      }
      break;
    case "LAND":
      if (runtime.status === "in-mission") {
        newStatus = "online";
        newTargetAltitude = 0;
        newReturning = false;
      }
      break;
    case "RTL":
      if (runtime.status === "in-mission") {
        newStatus = "in-mission"; // Stay in-mission while returning
        newReturning = true;
        newTargetAltitude = null; // Use current altitude

        // Cancel active mission if exists
        if (runtime.activeMissionId) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { cancelMission } = require("./mission-store");
          try {
            cancelMission(runtime.activeMissionId, "RTL_CANCELLED");
          } catch {
            // Mission may already be cancelled or not found, ignore
          }
        }
      }
      break;
  }

  // Update runtime state
  // Clear activeMissionId if RTL was executed (mission was cancelled)
  const clearedActiveMissionId =
    command === "RTL" && runtime.activeMissionId ? null : runtime.activeMissionId;

  const newState: DroneRuntimeState = {
    ...runtime,
    status: newStatus,
    armed: newArmed,
    returning: newReturning,
    targetAltitude: newTargetAltitude,
    activeMissionId: clearedActiveMissionId,
    lastCommand: command,
    lastCommandAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  runtimeStateStore.set(droneId, newState);

  return {
    success: true,
    newState,
  };
}

/**
 * Update runtime state (for telemetry simulation)
 */
export function updateRuntimeState(
  droneId: string,
  updates: Partial<
    Pick<
      DroneRuntimeState,
      "position" | "batteryPct" | "status" | "updatedAt" | "activeMissionId" | "offlineSince"
    >
  >
): void {
  const current = runtimeStateStore.get(droneId);
  if (!current) return;

  // Track offline status for timeout detection
  const newStatus = updates.status ?? current.status;
  const offlineSince =
    newStatus === "offline" && current.status !== "offline"
      ? new Date().toISOString()
      : newStatus !== "offline"
        ? null
        : current.offlineSince;

  runtimeStateStore.set(droneId, {
    ...current,
    ...updates,
    offlineSince,
    updatedAt: updates.updatedAt || new Date().toISOString(),
  });
}

/**
 * Get runtime state for telemetry generation (read-only access)
 */
export function getRuntimeStateForTelemetry(): Map<
  string,
  {
    status: string;
    armed: boolean;
    returning: boolean;
    targetAltitude: number | null;
    activeMissionId: string | null;
  }
> {
  const result = new Map<
    string,
    {
      status: string;
      armed: boolean;
      returning: boolean;
      targetAltitude: number | null;
      activeMissionId: string | null;
    }
  >();

  runtimeStateStore.forEach((state, droneId) => {
    result.set(droneId, {
      status: state.status,
      armed: state.armed,
      returning: state.returning,
      targetAltitude: state.targetAltitude,
      activeMissionId: state.activeMissionId,
    });
  });

  return result;
}

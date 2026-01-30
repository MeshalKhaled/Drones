import type { Mission, MissionFailureReason } from "@/lib/domain/types";
import { mockMissions } from "@/services/mock-data";

declare global {
  // eslint-disable-next-line no-var
  var __droneDashboardMissionStore: Mission[] | undefined;
  // eslint-disable-next-line no-var
  var __droneDashboardMissionsLinked: boolean | undefined;
}

type GlobalWithMissionStore = typeof globalThis & {
  __droneDashboardMissionStore?: Mission[];
  __droneDashboardMissionsLinked?: boolean;
};

function getMissionStore(): Mission[] {
  const g = globalThis as GlobalWithMissionStore;
  if (!g.__droneDashboardMissionStore) {
    // Initialize with mockMissions to ensure 50+ missions exist on startup.
    // Stored on globalThis so dev HMR / separate bundles share one instance.
    g.__droneDashboardMissionStore = [...mockMissions];
  }
  return g.__droneDashboardMissionStore;
}

function ensureDronesLinked(): void {
  const g = globalThis as GlobalWithMissionStore;
  if (!g.__droneDashboardMissionsLinked) {
    g.__droneDashboardMissionsLinked = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const droneStore = require("./drone-store");
      if (droneStore?.linkDronesWithActiveMissions) {
        droneStore.linkDronesWithActiveMissions();
      }
    } catch {
      // In test environment, drone-store may not be available
      // This is expected behavior for isolated unit tests
    }
  }
}

export function getMissions(): Mission[] {
  ensureDronesLinked();
  return getMissionStore();
}

export function addMission(mission: Mission): void {
  getMissionStore().push(mission);
}

export function updateMissionStore(missions: Mission[]): void {
  const g = globalThis as GlobalWithMissionStore;
  g.__droneDashboardMissionStore = missions;
}

/**
 * Get active mission for a drone (status = "in-progress")
 */
export function getActiveMissionForDrone(droneId: string): Mission | null {
  ensureDronesLinked();
  const missionStore = getMissionStore();
  return missionStore.find((m) => m.droneId === droneId && m.status === "in-progress") || null;
}

/**
 * Get mission by ID
 */
export function getMissionById(missionId: string): Mission | null {
  const missionStore = getMissionStore();
  return missionStore.find((m) => m.id === missionId) || null;
}

/**
 * Export getMissionById for use in mock-data.ts
 */
export function getMissionByIdForTelemetry(missionId: string): Mission | null {
  return getMissionById(missionId);
}

/**
 * Update mission in store
 */
function updateMission(missionId: string, updates: Partial<Mission>): void {
  const missionStore = getMissionStore();
  const index = missionStore.findIndex((m) => m.id === missionId);
  if (index !== -1) {
    const current = missionStore[index];
    if (!current) return;

    missionStore[index] = {
      ...current,
      ...updates,
      // Ensure required fields are preserved
      id: current.id,
      droneId: current.droneId,
      status: updates.status ?? current.status,
      startTime: updates.startTime ?? current.startTime,
      endTime: updates.endTime ?? current.endTime,
      success: updates.success ?? current.success,
      waypoints: current.waypoints,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    } as Mission;
  }
}

/**
 * Start a mission (transition pending → in-progress)
 */
export function startMission(missionId: string): Mission | null {
  const mission = getMissionById(missionId);
  if (!mission) return null;

  if (mission.status !== "pending") {
    throw new Error(`Mission ${missionId} cannot be started: status is ${mission.status}`);
  }

  // Check if drone already has an active mission
  const existingActive = getActiveMissionForDrone(mission.droneId);
  if (existingActive) {
    throw new Error(`Drone ${mission.droneId} already has an active mission: ${existingActive.id}`);
  }

  updateMission(missionId, {
    status: "in-progress",
    startedAt: new Date().toISOString(),
    startTime: new Date().toISOString(),
    currentWaypointIndex: 0,
  });

  // Add mission started event
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { addMissionEvent } = require("./mission-execution-store");
    addMissionEvent(missionId, {
      type: "MISSION_STARTED",
      message: "Mission started",
    });
  } catch {
    // Execution store may not be available in all contexts
  }

  return getMissionById(missionId);
}

/**
 * Advance mission to next waypoint
 * When all waypoints are reached, the mission is marked as completed
 */
export function advanceMissionWaypoint(missionId: string): Mission | null {
  const mission = getMissionById(missionId);
  if (!mission || mission.status !== "in-progress") return null;

  const currentIndex = mission.currentWaypointIndex ?? 0;
  const nextIndex = currentIndex + 1;

  if (nextIndex >= mission.waypoints.length) {
    // All waypoints reached - complete the mission successfully
    return completeMission(missionId, true);
  } else {
    updateMission(missionId, {
      currentWaypointIndex: nextIndex,
    });
  }

  return getMissionById(missionId);
}

/**
 * Complete a mission (transition in-progress → completed/failed)
 */
export function completeMission(
  missionId: string,
  success: boolean,
  failureReason?: MissionFailureReason
): Mission | null {
  const mission = getMissionById(missionId);
  if (!mission || mission.status !== "in-progress") return null;

  const missionStore = getMissionStore();
  const index = missionStore.findIndex((m: Mission) => m.id === missionId);
  if (index === -1) return null;

  const current = missionStore[index];
  if (!current) return null;

  // Update mission with completion data
  missionStore[index] = {
    ...current,
    status: success ? "completed" : "failed",
    completedAt: new Date().toISOString(),
    endTime: new Date().toISOString(),
    success,
    currentWaypointIndex: undefined,
    updatedAt: new Date().toISOString(),
    ...(success
      ? {}
      : {
          failedAt: new Date().toISOString(),
          failureReason: failureReason || undefined,
        }),
  } as Mission;

  // Add mission completion event
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { addMissionEvent, clearMissionExecution } = require("./mission-execution-store");
    addMissionEvent(missionId, {
      type: success ? "MISSION_COMPLETED" : "MISSION_FAILED",
      message: success ? "Mission completed successfully" : `Mission failed: ${failureReason || "Unknown reason"}`,
    });
    clearMissionExecution(missionId);
  } catch {
    // Execution store may not be available in all contexts
  }

  return getMissionById(missionId);
}

/**
 * Cancel a mission (transition pending/in-progress → cancelled)
 */
export function cancelMission(
  missionId: string,
  reason: MissionFailureReason = "CANCELLED_BY_USER"
): Mission | null {
  const mission = getMissionById(missionId);
  if (!mission) return null;

  // Only allow cancelling pending or in-progress missions
  if (mission.status !== "pending" && mission.status !== "in-progress") {
    throw new Error(`Mission ${missionId} cannot be cancelled: status is ${mission.status}`);
  }

  const missionStore = getMissionStore();
  const index = missionStore.findIndex((m: Mission) => m.id === missionId);
  if (index === -1) return null;

  const current = missionStore[index];
  if (!current) return null;

  // Update mission with cancellation data
  missionStore[index] = {
    ...current,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    endTime: new Date().toISOString(),
    success: false,
    currentWaypointIndex: undefined,
    updatedAt: new Date().toISOString(),
    failureReason: reason,
  } as Mission;

  // Add mission cancelled event
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { addMissionEvent, clearMissionExecution } = require("./mission-execution-store");
    addMissionEvent(missionId, {
      type: "MISSION_CANCELLED",
      message: `Mission cancelled: ${reason}`,
    });
    clearMissionExecution(missionId);
  } catch {
    // Execution store may not be available in all contexts
  }

  return getMissionById(missionId);
}

/**
 * Mission execution state store
 * Tracks waypoint action delays and mission events
 */

import type { MissionEvent } from "@/lib/domain/types";

declare global {
  // eslint-disable-next-line no-var
  var __droneDashboardMissionExecutionStore: Map<
    string,
    {
      waypointActionDelays: Map<number, { startTime: number; action: string; duration: number }>;
      events: MissionEvent[];
    }
  > | undefined;
}

type GlobalWithMissionExecutionStore = typeof globalThis & {
  __droneDashboardMissionExecutionStore?: Map<
    string,
    {
      waypointActionDelays: Map<number, { startTime: number; action: string; duration: number }>;
      events: MissionEvent[];
    }
  >;
};

const executionStore: Map<
  string,
  {
    waypointActionDelays: Map<number, { startTime: number; action: string; duration: number }>;
    events: MissionEvent[];
  }
> = (() => {
  const g = globalThis as GlobalWithMissionExecutionStore;
  if (!g.__droneDashboardMissionExecutionStore) {
    g.__droneDashboardMissionExecutionStore = new Map();
  }
  return g.__droneDashboardMissionExecutionStore;
})();

/**
 * Get action delay duration in seconds
 */
export function getActionDelay(action: string): number {
  switch (action) {
    case "LOITER":
      return 5; // 5 seconds
    case "TAKE_PHOTO":
      return 1; // 1 second
    case "SCAN":
      return 3; // 3 seconds
    case "DELIVER_PAYLOAD":
      return 4; // 4 seconds
    case "NONE":
    default:
      return 0;
  }
}

/**
 * Check if waypoint action is still executing (delay not expired)
 */
export function isWaypointActionExecuting(
  missionId: string,
  waypointIndex: number,
  currentTime: number
): boolean {
  const missionState = executionStore.get(missionId);
  if (!missionState) return false;

  const delay = missionState.waypointActionDelays.get(waypointIndex);
  if (!delay) return false;

  return currentTime < delay.startTime + delay.duration * 1000;
}

/**
 * Start waypoint action execution (record delay)
 */
export function startWaypointAction(
  missionId: string,
  waypointIndex: number,
  action: string,
  currentTime: number
): void {
  if (!executionStore.has(missionId)) {
    executionStore.set(missionId, {
      waypointActionDelays: new Map(),
      events: [],
    });
  }

  const missionState = executionStore.get(missionId);
  if (!missionState) return;

  const duration = getActionDelay(action);
  missionState.waypointActionDelays.set(waypointIndex, {
    startTime: currentTime,
    action,
    duration,
  });

  // Add event
  if (action !== "NONE") {
      missionState.events.push({
        timestamp: new Date(currentTime).toISOString(),
        type: "ACTION_EXECUTED",
        waypointIndex,
        action: action as "TAKE_PHOTO" | "LOITER" | "SCAN" | "DELIVER_PAYLOAD" | "NONE",
        message: `Executing ${action} at waypoint ${waypointIndex + 1}`,
      });

    // Keep only last 50 events per mission
    if (missionState.events.length > 50) {
      missionState.events.shift();
    }
  }
}

/**
 * Get recent mission events (last N events)
 */
export function getMissionEvents(missionId: string, limit: number = 5): MissionEvent[] {
  const missionState = executionStore.get(missionId);
  if (!missionState) return [];

  return missionState.events.slice(-limit).reverse(); // Most recent first
}

/**
 * Add mission event
 */
export function addMissionEvent(
  missionId: string,
  event: Omit<MissionEvent, "timestamp">
): void {
  if (!executionStore.has(missionId)) {
    executionStore.set(missionId, {
      waypointActionDelays: new Map(),
      events: [],
    });
  }

  const missionState = executionStore.get(missionId);
  if (!missionState) return;

  missionState.events.push({
    ...event,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 50 events per mission
  if (missionState.events.length > 50) {
    missionState.events.shift();
  }
}

/**
 * Clear mission execution state (when mission completes/cancels)
 */
export function clearMissionExecution(missionId: string): void {
  executionStore.delete(missionId);
}

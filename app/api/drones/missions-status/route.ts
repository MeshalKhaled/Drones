import { NextResponse } from "next/server";
import { listDroneRuntimeStates } from "@/lib/stores/drone-store";
import { getActiveMissionForDrone } from "@/lib/stores/mission-store";

/**
 * GET /api/drones/missions-status
 * Returns mission status for all drones (which ones have active missions)
 */
export async function GET() {
  try {
    const runtimeStates = listDroneRuntimeStates();

    const dronesMissionStatus: Record<
      string,
      {
        hasActiveMission: boolean;
        activeMissionId: string | null;
        currentWaypointIndex: number | null;
        totalWaypoints: number | null;
        missionStatus: string | null;
      }
    > = {};

    runtimeStates.forEach((_state, droneId) => {
      const activeMission = getActiveMissionForDrone(droneId);

      dronesMissionStatus[droneId] = {
        hasActiveMission: !!activeMission,
        activeMissionId: activeMission?.id || null,
        currentWaypointIndex: activeMission?.currentWaypointIndex ?? null,
        totalWaypoints: activeMission?.waypoints.length ?? null,
        missionStatus: activeMission?.status || null,
      };
    });

    return NextResponse.json({
      data: dronesMissionStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

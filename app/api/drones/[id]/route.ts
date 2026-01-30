import { NextResponse } from "next/server";
import { getDroneWithState } from "@/lib/stores/drone-store";
import { droneProfiles } from "@/lib/data/drones";

/**
 * GET /api/drones/[id]
 * Returns full drone data (profile + runtime state)
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: droneId } = await params;

    // Simulate latency (50-150ms)
    const latency = 50 + Math.random() * 100;
    await new Promise((resolve) => setTimeout(resolve, latency));

    // Get drone with state from store
    const droneWithState = getDroneWithState(droneId);

    if (!droneWithState) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: `Drone ${droneId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Get static profile
    const profile = droneProfiles.find((p) => p.id === droneId);

    return NextResponse.json({
      data: {
        id: droneId,
        name: droneWithState.profile.name,
        model: profile?.model ?? "Unknown",
        serialNumber: profile?.serialNumber ?? "Unknown",
        status: droneWithState.runtime.status,
        batteryPct: droneWithState.runtime.batteryPct,
        flightHours: droneWithState.profile.flightHours,
        lastMission: droneWithState.profile.lastMission,
        position: droneWithState.runtime.position,
        health: droneWithState.profile.health,
        armed: droneWithState.runtime.armed,
        activeMissionId: droneWithState.runtime.activeMissionId,
        updatedAt: droneWithState.runtime.updatedAt,
      },
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

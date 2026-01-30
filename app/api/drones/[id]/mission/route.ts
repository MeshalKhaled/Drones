import { NextResponse } from "next/server";
import { getActiveMissionForDrone } from "@/lib/stores/mission-store";

/**
 * GET /api/drones/[id]/mission
 * Returns the active mission for a specific drone
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: droneId } = await params;

    // Simulate latency (50-150ms)
    const latency = 50 + Math.random() * 100;
    await new Promise((resolve) => setTimeout(resolve, latency));

    const activeMission = getActiveMissionForDrone(droneId);

    return NextResponse.json({
      data: activeMission,
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

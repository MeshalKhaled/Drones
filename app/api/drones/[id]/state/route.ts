import { NextRequest, NextResponse } from "next/server";
import { getDroneRuntimeState, getDroneProfile } from "@/lib/stores/drone-store";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateError(): boolean {
  return Math.random() < 0.05; // 5% error rate
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: droneId } = await params;

    // Simulate latency (50-150ms - faster for state polling)
    const latency = 50 + Math.random() * 100;
    await delay(latency);

    // Simulate error (5% chance)
    if (shouldSimulateError()) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "INTERNAL_ERROR",
            message: "Simulated server error",
          },
        },
        { status: 500 }
      );
    }

    // Check if drone exists
    const profile = getDroneProfile(droneId);
    if (!profile) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Drone not found",
          },
        },
        { status: 404 }
      );
    }

    // Get runtime state
    const runtime = getDroneRuntimeState(droneId);
    if (!runtime) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "STATE_NOT_FOUND",
            message: "Drone state not available",
          },
        },
        { status: 404 }
      );
    }

    // Return state needed for command availability
    return NextResponse.json({
      data: {
        status: runtime.status,
        armed: runtime.armed,
        returning: runtime.returning,
        lastCommand: runtime.lastCommand,
        lastCommandAt: runtime.lastCommandAt,
        targetAltitude: runtime.targetAltitude,
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

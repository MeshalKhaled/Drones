"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
  applyCommand,
  getDroneRuntimeState,
  getDroneProfile,
  type DroneCommand,
} from "@/lib/stores/drone-store";
import type { DroneStatus } from "@/lib/domain/types";

const DroneCommandSchema = z.enum(["ARM", "TAKEOFF", "LAND", "RTL"]);

// Re-export for backward compatibility
export type { DroneCommand };

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateError(): boolean {
  return Math.random() < 0.05; // 5% error rate
}

export async function sendDroneCommandAction(droneId: string, command: DroneCommand) {
  try {
    // Simulate latency (200-500ms)
    const latency = 200 + Math.random() * 300;
    await delay(latency);

    // Validate inputs
    const validatedCommand = DroneCommandSchema.parse(command);

    // Check drone exists
    const profile = getDroneProfile(droneId);
    if (!profile) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Drone not found",
        },
      };
    }

    // Simulate error (5% chance)
    if (shouldSimulateError()) {
      return {
        success: false,
        error: {
          code: "COMMAND_FAILED",
          message: "Command failed to execute",
        },
      };
    }

    // Apply command to canonical store
    const result = applyCommand(droneId, validatedCommand);

    if (!result.success) {
      return result;
    }

    // Revalidate affected pages
    revalidatePath(`/drones/${droneId}`);
    revalidatePath(`/fleet`);
    revalidatePath(`/map`);

    return {
      success: true,
      data: {
        droneId,
        command: validatedCommand,
        newStatus: result.newState?.status,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid command",
          details: error.errors,
        },
      };
    }

    logger.error("Failed to send drone command:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to send command",
      },
    };
  }
}

// Helper to get current drone status (for server components)
export async function getDroneStatus(droneId: string): Promise<DroneStatus | null> {
  const runtime = getDroneRuntimeState(droneId);
  return runtime?.status || null;
}

// Helper to get full drone state (for server components)
export async function getDroneState(droneId: string) {
  const runtime = getDroneRuntimeState(droneId);
  if (!runtime) return null;

  return {
    status: runtime.status,
    lastCommand: runtime.lastCommand,
    lastCommandAt: runtime.lastCommandAt,
    armed: runtime.armed,
    returning: runtime.returning,
    targetAltitude: runtime.targetAltitude,
  };
}

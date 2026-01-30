"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { MissionDraftSchema, MissionSchema } from "@/lib/domain/types";
import {
  getMissions,
  addMission,
  startMission,
  getMissionById,
  cancelMission,
} from "@/lib/stores/mission-store";
import { getDroneRuntimeState, updateRuntimeState } from "@/lib/stores/drone-store";
import type { Mission, MissionDraft } from "@/lib/domain/types";

export async function createMissionAction(draft: MissionDraft) {
  try {
    // Validate draft server-side
    const validatedDraft = MissionDraftSchema.parse(draft);

    // Convert MissionWaypoint[] to Waypoint[] (preserve speed and action)
    const waypoints = validatedDraft.waypoints.map((wp, index) => ({
      lat: wp.lat,
      lng: wp.lng,
      alt: wp.alt,
      order: index, // Ensure order is sequential
      speed: wp.speed, // Preserve speed
      action: wp.action, // Preserve action
    }));

    // Create mission
    const now = new Date().toISOString();
    const newMission: Mission = MissionSchema.parse({
      id: crypto.randomUUID(),
      droneId: validatedDraft.droneId,
      status: "pending" as const,
      startTime: null,
      endTime: null,
      success: false,
      waypoints,
      createdAt: now,
      updatedAt: now,
    });

    // Add to store
    addMission(newMission);

    // Revalidate paths
    revalidatePath("/missions");
    revalidatePath("/fleet");

    return {
      success: true,
      data: newMission,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid mission data",
          details: error.errors,
        },
      };
    }

    logger.error("Failed to create mission:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to create mission",
      },
    };
  }
}

// Export for testing/debugging
export async function getAllMissions(): Promise<Mission[]> {
  return getMissions();
}

/**
 * Start a mission (transition pending → in-progress)
 * Also teleports the drone to the first waypoint
 */
export async function startMissionAction(missionId: string) {
  try {
    // Simulate latency (200-500ms)
    const latency = 200 + Math.random() * 300;
    await new Promise((resolve) => setTimeout(resolve, latency));

    // Validate mission exists
    const mission = getMissionById(missionId);
    if (!mission) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Mission not found",
        },
      };
    }

    // Validate mission is pending
    if (mission.status !== "pending") {
      return {
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Mission cannot be started: current status is ${mission.status}`,
        },
      };
    }

    // Validate drone exists and is available
    const droneState = getDroneRuntimeState(mission.droneId);
    if (!droneState) {
      return {
        success: false,
        error: {
          code: "DRONE_NOT_FOUND",
          message: "Assigned drone not found",
        },
      };
    }

    // Check if drone already has an active mission
    if (droneState.activeMissionId) {
      return {
        success: false,
        error: {
          code: "DRONE_BUSY",
          message: "Drone already has an active mission",
        },
      };
    }

    // Start the mission
    const startedMission = startMission(missionId);
    if (!startedMission) {
      return {
        success: false,
        error: {
          code: "START_FAILED",
          message: "Failed to start mission",
        },
      };
    }

    // Get the first waypoint to teleport drone there
    const sortedWaypoints = [...mission.waypoints].sort((a, b) => a.order - b.order);
    const firstWaypoint = sortedWaypoints[0];

    // Update drone runtime state - move to first waypoint and set mission
    updateRuntimeState(mission.droneId, {
      status: "in-mission",
      activeMissionId: missionId,
      // Teleport drone to first waypoint
      position: firstWaypoint
        ? {
            lat: firstWaypoint.lat,
            lng: firstWaypoint.lng,
            alt: firstWaypoint.alt,
            speed: 0, // Starting, will accelerate
          }
        : droneState.position,
      updatedAt: new Date().toISOString(),
    });

    logger.info(
      `Mission ${missionId} started for drone ${mission.droneId}. Teleported to first waypoint.`
    );

    // Revalidate paths
    revalidatePath("/missions");
    revalidatePath(`/drones/${mission.droneId}`);
    revalidatePath("/fleet");
    revalidatePath("/map");

    return {
      success: true,
      data: startedMission,
    };
  } catch (error) {
    logger.error("Failed to start mission:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to start mission",
      },
    };
  }
}

/**
 * Cancel a mission (transition pending/in-progress → cancelled)
 */
export async function cancelMissionAction(missionId: string) {
  try {
    // Simulate latency (200-500ms)
    const latency = 200 + Math.random() * 300;
    await new Promise((resolve) => setTimeout(resolve, latency));

    // Validate mission exists
    const mission = getMissionById(missionId);
    if (!mission) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Mission not found",
        },
      };
    }

    // Cancel the mission
    const cancelledMission = cancelMission(missionId, "CANCELLED_BY_USER");
    if (!cancelledMission) {
      return {
        success: false,
        error: {
          code: "CANCEL_FAILED",
          message: "Failed to cancel mission",
        },
      };
    }

    // If mission was active on a drone, clear activeMissionId and update status
    const droneState = getDroneRuntimeState(mission.droneId);
    if (droneState && droneState.activeMissionId === missionId) {
      // Only set to online if not returning (RTL takes precedence)
      const newStatus = droneState.returning ? droneState.status : "online";
      updateRuntimeState(mission.droneId, {
        activeMissionId: null,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }

    logger.info(`Mission ${missionId} cancelled`);

    // Revalidate paths
    revalidatePath("/missions");
    revalidatePath(`/drones/${mission.droneId}`);
    revalidatePath("/fleet");
    revalidatePath("/map");

    return {
      success: true,
      data: cancelledMission,
    };
  } catch (error) {
    logger.error("Failed to cancel mission:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to cancel mission",
      },
    };
  }
}

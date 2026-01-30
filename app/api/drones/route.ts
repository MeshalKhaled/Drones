import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listDronesWithState } from "@/lib/stores/drone-store";
import { ApiResponseSchema, DronesQueryParamsSchema } from "@/lib/domain/types";
import { DroneSchema } from "@/lib/domain/types";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateError(): boolean {
  return Math.random() < 0.05; // 5% error rate
}

/**
 * Merge profile + runtime state into Drone format for API response
 */
function mergeDroneData(droneWithState: {
  profile: {
    id: string;
    name: string;
    flightHours: number;
    lastMission: string | null;
    health: { signalStrength: number; gpsQuality: number; motorHealth: number; overall: number };
  };
  runtime: {
    status: string;
    position: { lat: number; lng: number; alt: number; speed: number };
    batteryPct: number;
    updatedAt: string;
  };
}) {
  return {
    id: droneWithState.profile.id,
    name: droneWithState.profile.name,
    status: droneWithState.runtime.status,
    batteryPct: droneWithState.runtime.batteryPct,
    flightHours: droneWithState.profile.flightHours,
    lastMission: droneWithState.profile.lastMission,
    updatedAt: droneWithState.runtime.updatedAt,
    position: droneWithState.runtime.position,
    health: droneWithState.profile.health,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Simulate latency (200-500ms)
    const latency = 200 + Math.random() * 300;
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    // Check if requesting single drone by ID first
    const droneId = searchParams.get("id");
    if (droneId) {
      const dronesWithState = listDronesWithState();
      const droneWithState = dronesWithState.find((d) => d.profile.id === droneId);
      if (!droneWithState) {
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
      // Return single drone (merged profile + runtime)
      const merged = mergeDroneData(droneWithState);
      return NextResponse.json({
        data: merged,
        meta: {},
      });
    }

    const params: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validatedParams = DronesQueryParamsSchema.parse(params);

    // Get all drones with merged state
    let filtered = listDronesWithState().map(mergeDroneData);

    // For map scope, return lightweight profiles (static fields only)
    if (validatedParams.scope === "map") {
      // Return minimal fields needed for map markers
      const mapDrones = filtered.map((drone) => ({
        id: drone.id,
        name: drone.name,
        status: drone.status,
        batteryPct: drone.batteryPct,
        flightHours: drone.flightHours, // Keep for compatibility
        lastMission: drone.lastMission, // Keep for compatibility
        updatedAt: drone.updatedAt, // Keep for compatibility
        position: drone.position,
        health: drone.health, // Keep for compatibility
      }));
      const response = ApiResponseSchema(z.array(DroneSchema)).parse({
        data: mapDrones,
        meta: {
          total: mapDrones.length,
        },
      });
      return NextResponse.json(response);
    }

    // Apply search filter
    if (validatedParams.search) {
      const searchLower = validatedParams.search.toLowerCase();
      filtered = filtered.filter(
        (drone) =>
          drone.name.toLowerCase().includes(searchLower) ||
          drone.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter (now uses runtime state)
    if (validatedParams.status) {
      filtered = filtered.filter((drone) => drone.status === validatedParams.status);
    }

    // Apply sorting (now uses runtime state)
    if (validatedParams.sort) {
      filtered.sort((a, b) => {
        switch (validatedParams.sort) {
          case "name":
            return a.name.localeCompare(b.name);
          case "status":
            return a.status.localeCompare(b.status);
          case "batteryPct":
            return b.batteryPct - a.batteryPct;
          case "updatedAt":
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default:
            return 0;
        }
      });
    }

    const response = ApiResponseSchema(z.array(DroneSchema)).parse({
      data: filtered,
      meta: {
        total: filtered.length,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 400 }
    );
  }
}

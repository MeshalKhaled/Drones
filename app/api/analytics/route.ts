import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
  aggregateFlightHours,
  aggregateBatteryHealth,
  aggregateMissionSuccess,
  aggregateActiveInactive,
  type TimeRange,
} from "@/lib/domain/analytics";
import { ApiResponseSchema } from "@/lib/domain/types";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateError(): boolean {
  return Math.random() < 0.05; // 5% error rate
}

const TimeRangeSchema = z.enum(["24h", "7d", "30d"]);

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
    const rangeParam = searchParams.get("range") || "7d";

    let range: TimeRange;
    try {
      range = TimeRangeSchema.parse(rangeParam);
    } catch {
      range = "7d"; // Default to 7d
    }

    // Aggregate all analytics data
    const flightHours = aggregateFlightHours(range);
    const batteryHealth = aggregateBatteryHealth(range);
    const missionSuccess = aggregateMissionSuccess(range);
    const activeInactive = aggregateActiveInactive();

    const response = ApiResponseSchema(
      z.object({
        flightHours: z.object({
          total: z.number(),
          byDrone: z.array(
            z.object({
              droneId: z.string(),
              droneName: z.string(),
              hours: z.number(),
            })
          ),
        }),
        batteryHealth: z.object({
          timestamps: z.array(z.string()),
          averages: z.array(z.number()),
          byDrone: z.array(
            z.object({
              droneId: z.string(),
              droneName: z.string(),
              data: z.array(
                z.object({
                  timestamp: z.string(),
                  battery: z.number(),
                })
              ),
            })
          ),
        }),
        missionSuccess: z.object({
          successRate: z.number(),
          total: z.number(),
          successful: z.number(),
          failed: z.number(),
          byStatus: z.array(
            z.object({
              status: z.string(),
              count: z.number(),
            })
          ),
        }),
        activeInactive: z.object({
          active: z.number(),
          inactive: z.number(),
          byStatus: z.array(
            z.object({
              status: z.string(),
              count: z.number(),
            })
          ),
        }),
      })
    ).parse({
      data: {
        flightHours,
        batteryHealth,
        missionSuccess,
        activeInactive,
      },
      meta: {
        range,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Analytics API error:", error);
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

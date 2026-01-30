import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMissions } from "@/lib/stores/mission-store";
import { ApiResponseSchema, MissionsQueryParamsSchema } from "@/lib/domain/types";
import { MissionSchema } from "@/lib/domain/types";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateError(): boolean {
  return Math.random() < 0.05; // 5% error rate
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
    const params: Record<string, string | undefined> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const validatedParams = MissionsQueryParamsSchema.parse(params);

    // Get missions from shared store (includes newly created ones)
    const allMissions = getMissions();

    // Filter missions
    let filtered = [...allMissions];

    // Apply droneId filter
    if (validatedParams.droneId) {
      filtered = filtered.filter((mission) => mission.droneId === validatedParams.droneId);
    }

    // Apply search filter
    if (validatedParams.search) {
      const searchLower = validatedParams.search.toLowerCase();
      filtered = filtered.filter(
        (mission) =>
          mission.id.toLowerCase().includes(searchLower) ||
          mission.droneId.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (validatedParams.status) {
      filtered = filtered.filter((mission) => mission.status === validatedParams.status);
    }

    // Apply sorting
    if (validatedParams.sort) {
      filtered.sort((a, b) => {
        switch (validatedParams.sort) {
          case "startDate":
            const aStart = a.startTime ? new Date(a.startTime).getTime() : 0;
            const bStart = b.startTime ? new Date(b.startTime).getTime() : 0;
            return bStart - aStart; // Newest first
          case "status":
            return a.status.localeCompare(b.status);
          case "createdAt":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    } else {
      // Default: sort by createdAt (newest first)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Apply pagination
    const page = validatedParams.page || 1;
    const pageSize = validatedParams.pageSize || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    const response = ApiResponseSchema(z.array(MissionSchema)).parse({
      data: paginated,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
        hasMore,
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

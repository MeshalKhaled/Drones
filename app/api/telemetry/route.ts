import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateTelemetry } from "@/services/mock-data";
import { ApiResponseSchema, TelemetryQueryParamsSchema } from "@/lib/domain/types";
import { TelemetrySchema } from "@/lib/domain/types";
import { logger } from "@/lib/logger";

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

    // Parse query parameters safely
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};

    // Only add non-empty params
    searchParams.forEach((value, key) => {
      if (value && value.trim()) {
        params[key] = value.trim();
      }
    });

    // Validate params with safe fallback
    let validatedParams: z.infer<typeof TelemetryQueryParamsSchema>;
    try {
      validatedParams = TelemetryQueryParamsSchema.parse(params);
    } catch (validationError) {
      // If validation fails, default to fleet scope
      logger.warn("Telemetry params validation failed, defaulting to fleet:", validationError);
      validatedParams = { scope: "fleet" };
    }

    // Generate telemetry data based on scope
    let telemetry: ReturnType<typeof generateTelemetry>;
    try {
      if (validatedParams.scope === "map") {
        // Map scope: return telemetry for all drones (includes mission fields for transition detection)
        telemetry = generateTelemetry();
      } else if (validatedParams.droneId) {
        // Return telemetry for specific drone
        telemetry = generateTelemetry(validatedParams.droneId);
      } else if (
        validatedParams.scope === "fleet" ||
        (!validatedParams.scope && !validatedParams.droneId)
      ) {
        // Return telemetry for all active drones (online or in-mission)
        telemetry = generateTelemetry();
      } else {
        // Default: return fleet telemetry
        telemetry = generateTelemetry();
      }
    } catch (genError) {
      logger.error("Error generating telemetry:", genError);
      throw new Error(
        `Failed to generate telemetry: ${genError instanceof Error ? genError.message : "Unknown error"}`
      );
    }

    // Validate each telemetry item before creating response
    const validatedTelemetry: z.infer<typeof TelemetrySchema>[] = [];
    for (const t of telemetry) {
      try {
        validatedTelemetry.push(TelemetrySchema.parse(t));
      } catch (err) {
        logger.error("Telemetry item validation failed:", err, t);
        // Skip invalid items instead of failing the entire request
        // Or throw if you want to fail fast
        if (err instanceof z.ZodError) {
          logger.warn(`Skipping invalid telemetry item for drone ${t.droneId}:`, err.errors);
          continue;
        }
        throw err;
      }
    }

    // Ensure we have at least some valid telemetry
    if (validatedTelemetry.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NO_DATA",
            message: "No valid telemetry data available",
          },
        },
        { status: 404 }
      );
    }

    // Validate response structure
    let response;
    try {
      response = ApiResponseSchema(z.array(TelemetrySchema)).parse({
        data: validatedTelemetry,
        meta: {
          total: validatedTelemetry.length,
        },
      });
    } catch (responseError) {
      logger.error("Response validation failed:", responseError);
      throw responseError;
    }

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Telemetry API error:", error);

    // Provide more detailed error information
    const errorMessage =
      error instanceof z.ZodError
        ? `Validation error: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
        : error instanceof Error
          ? error.message
          : "Unknown error";

    // Return 500 for unexpected errors, 400 for validation errors
    const statusCode = error instanceof z.ZodError ? 400 : 500;

    return NextResponse.json(
      {
        data: null,
        error: {
          code: error instanceof z.ZodError ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
          message: errorMessage,
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
      },
      { status: statusCode }
    );
  }
}

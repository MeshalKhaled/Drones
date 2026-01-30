/**
 * Telemetry summary endpoint running on Edge Runtime
 *
 * This endpoint demonstrates Edge Runtime usage for lightweight
 * stateless API responses. In production, this would fetch from
 * an external data source (database, KV store, etc.)
 */

export const runtime = "edge";

import { NextResponse } from "next/server";

interface TelemetrySummary {
  fleetSize: number;
  activeCount: number;
  chargingCount: number;
  offlineCount: number;
  averageBattery: number;
  totalFlightHours: number;
  timestamp: string;
}

export async function GET() {
  // In a real app, this would fetch from an edge-compatible
  // data source like Upstash Redis, Planetscale, or similar
  const summary: TelemetrySummary = {
    fleetSize: 25,
    activeCount: 12,
    chargingCount: 5,
    offlineCount: 3,
    averageBattery: 72,
    totalFlightHours: 3847.5,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(
    { data: summary },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    }
  );
}

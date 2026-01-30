/**
 * Health check endpoint running on Edge Runtime
 *
 * Edge Runtime benefits:
 * - Lower latency (runs on edge nodes closer to users)
 * - Lower cold start time
 * - Cost effective for simple endpoints
 *
 * Limitations:
 * - No Node.js APIs (fs, path, etc.)
 * - No in-memory state sharing between requests
 * - Limited execution time (30s max on Vercel)
 */

export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET() {
  const response = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    runtime: "edge",
    version: process.env.npm_package_version || "0.1.0",
    region: process.env.VERCEL_REGION || "local",
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

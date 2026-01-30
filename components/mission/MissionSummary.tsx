"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, MapPin, Route, Clock } from "lucide-react";
import type { MissionWaypoint } from "@/lib/domain/types";
import { MissionDraftSchema } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

interface MissionSummaryProps {
  waypoints: MissionWaypoint[];
  droneId: string | null;
  showValidationErrors?: boolean;
}

// Calculate distance between two points (Haversine formula, simplified)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function MissionSummary({
  waypoints,
  droneId,
  showValidationErrors = false,
}: MissionSummaryProps) {
  const validation = useMemo(() => {
    if (!droneId) {
      return {
        valid: false,
        errors: ["Please select a drone"],
      };
    }

    if (waypoints.length < 5) {
      return {
        valid: false,
        errors: [`At least 5 waypoints required (currently ${waypoints.length})`],
      };
    }

    try {
      MissionDraftSchema.parse({
        droneId,
        waypoints: waypoints.map((wp) => ({
          ...wp,
          // Remove client-only id field for validation
          id: wp.id,
        })),
      });
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> };
        return {
          valid: false,
          errors: zodError.errors.map((e) => {
            const path = e.path.join(".");
            return `${path}: ${e.message}`;
          }),
        };
      }
      return {
        valid: false,
        errors: ["Validation failed"],
      };
    }
  }, [waypoints, droneId]);

  const stats = useMemo(() => {
    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const wp1 = sorted[i];
      const wp2 = sorted[i + 1];
      if (!wp1 || !wp2) continue;
      const distance = calculateDistance(wp1.lat, wp1.lng, wp2.lat, wp2.lng);
      totalDistance += distance;
      // Estimate time based on average speed between waypoints
      const avgSpeed = (wp1.speed + wp2.speed) / 2;
      totalTime += distance / avgSpeed;
    }

    return {
      waypointCount: waypoints.length,
      totalDistance,
      estimatedDuration: totalTime,
    };
  }, [waypoints]);

  return (
    <div className="space-y-4 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
        <Route size={18} />
        Mission Summary
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
            <MapPin size={14} />
            <span className="text-xs">Waypoints</span>
          </div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {stats.waypointCount}
          </div>
        </div>
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
            <Route size={14} />
            <span className="text-xs">Distance</span>
          </div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {(stats.totalDistance / 1000).toFixed(2)} km
          </div>
        </div>
        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
            <Clock size={14} />
            <span className="text-xs">Duration</span>
          </div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {Math.round(stats.estimatedDuration / 60)} min
          </div>
        </div>
      </div>

      {/* Validation Status - Only show errors if showValidationErrors is true */}
      {showValidationErrors && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-md border p-3",
            validation.valid
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          )}
        >
          {validation.valid ? (
            <CheckCircle2
              size={18}
              className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400"
            />
          ) : (
            <XCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
          )}
          <div className="flex-1">
            <div
              className={cn(
                "mb-1 text-sm font-medium",
                validation.valid
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              )}
            >
              {validation.valid ? "Mission is valid" : "Cannot save mission"}
            </div>
            {validation.errors.length > 0 && (
              <ul className="list-inside list-disc space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
            {!validation.valid && (
              <p className="mt-2 text-xs italic text-zinc-500 dark:text-zinc-400">
                Note: You can continue planning. These requirements only apply when saving.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Always show success state when valid */}
      {validation.valid && (
        <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2
            size={18}
            className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-green-700 dark:text-green-400">
              Mission is ready to save
            </div>
          </div>
        </div>
      )}

      {/* Show helpful note when not valid but user hasn't tried to save yet */}
      {!showValidationErrors && !validation.valid && (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <p className="mb-1">
              💡 <strong>Planning mode:</strong> You can add waypoints freely.
            </p>
            <p>Requirements (5+ waypoints, drone selected) only apply when saving.</p>
          </div>
        </div>
      )}
    </div>
  );
}

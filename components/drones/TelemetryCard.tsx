"use client";

import { useMemo } from "react";
import { useTelemetryPolling } from "@/hooks/data/useTelemetryPolling";
import { Activity, MapPin, Battery, Gauge, Satellite } from "lucide-react";
import { cn } from "@/lib/utils";
import { surface, border, text } from "@/lib/theme";
import { TelemetrySkeleton } from "@/components/ui/skeletons";

interface TelemetryCardProps {
  droneId: string;
}

export function TelemetryCard({ droneId }: TelemetryCardProps) {
  const { telemetry, isLoading, isError } = useTelemetryPolling({
    scope: "drone",
    droneId,
    enabled: true,
    refetchInterval: typeof window !== "undefined" && document.hidden ? 6000 : 2000, // 2s active, 6s inactive
  });

  const latestTelemetry = useMemo(() => {
    if (!telemetry || telemetry.length === 0) return null;
    return telemetry[0]; // Most recent
  }, [telemetry]);

  if (isLoading && !latestTelemetry) {
    return <TelemetrySkeleton />;
  }

  if (isError) {
    return (
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Live Telemetry</h2>
        <div className={cn("py-8 text-center", text.muted)}>
          <p className="text-sm">Failed to load telemetry data</p>
        </div>
      </div>
    );
  }

  if (!latestTelemetry) {
    return (
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Live Telemetry</h2>
        <div className={cn("py-8 text-center", text.muted)}>
          <p className="text-sm">No telemetry data available</p>
        </div>
      </div>
    );
  }

  const timestamp = new Date(latestTelemetry.timestamp);

  // R-100: ARIA live region for critical battery alerts
  const isBatteryLow = latestTelemetry.batteryPct < 20;
  const isBatteryCritical = latestTelemetry.batteryPct < 10;

  return (
    <div className={cn("rounded-md border p-6", surface.base, border.default)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={cn("text-lg font-semibold", text.primary)}>Live Telemetry</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden="true" />
          <span className={cn("text-xs", text.muted)}>Live</span>
        </div>
      </div>

      {/* R-100: Screen reader announcements for critical status changes */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {isBatteryCritical &&
          `Critical battery alert: ${latestTelemetry.batteryPct.toFixed(0)} percent remaining`}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isBatteryLow &&
          !isBatteryCritical &&
          `Low battery warning: ${latestTelemetry.batteryPct.toFixed(0)} percent remaining`}
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="region"
        aria-label="Telemetry readings"
      >
        <div className={cn("rounded-md p-4", surface.subtle)}>
          <div className={cn("mb-2 flex items-center gap-2", text.muted)}>
            <MapPin size={16} />
            <span className="text-sm">Position</span>
          </div>
          <p className={cn("text-sm font-medium", text.primary)}>
            {latestTelemetry.position.lat.toFixed(6)}, {latestTelemetry.position.lng.toFixed(6)}
          </p>
        </div>

        <div className={cn("rounded-md p-4", surface.subtle)}>
          <div className={cn("mb-2 flex items-center gap-2", text.muted)}>
            <Activity size={16} />
            <span className="text-sm">Altitude</span>
          </div>
          <p className={cn("text-sm font-medium", text.primary)}>
            {latestTelemetry.altitude.toFixed(1)} m
          </p>
        </div>

        <div className={cn("rounded-md p-4", surface.subtle)}>
          <div className={cn("mb-2 flex items-center gap-2", text.muted)}>
            <Gauge size={16} />
            <span className="text-sm">Speed</span>
          </div>
          <p className={cn("text-sm font-medium", text.primary)}>
            {latestTelemetry.speed.toFixed(1)} m/s
          </p>
        </div>

        <div className={cn("rounded-md p-4", surface.subtle)}>
          <div className={cn("mb-2 flex items-center gap-2", text.muted)}>
            <Battery size={16} />
            <span className="text-sm">Battery</span>
          </div>
          <p className={cn("text-sm font-medium", text.primary)}>
            {latestTelemetry.batteryPct.toFixed(1)}%
          </p>
        </div>

        <div className={cn("rounded-md p-4", surface.subtle)}>
          <div className={cn("mb-2 flex items-center gap-2", text.muted)}>
            <Satellite size={16} />
            <span className="text-sm">GPS Quality</span>
          </div>
          <p className={cn("text-sm font-medium", text.primary)}>
            {latestTelemetry.gpsQuality.toFixed(1)}%
          </p>
        </div>

        <div className={cn("rounded-md p-4", surface.subtle)}>
          <div className={cn("mb-2 flex items-center gap-2", text.muted)}>
            <Activity size={16} />
            <span className="text-sm">Last Update</span>
          </div>
          <p className={cn("text-xs font-medium", text.primary)}>
            {timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* DEV: Show status and altitude for debugging */}
      {process.env.NODE_ENV === "development" && (
        <div className={cn("mt-4 border-t pt-4 text-xs", border.default, text.muted)}>
          <p>Status: {latestTelemetry.position.alt > 0 ? "Flying" : "Grounded"}</p>
          <p>Altitude: {latestTelemetry.altitude.toFixed(1)}m</p>
        </div>
      )}
    </div>
  );
}

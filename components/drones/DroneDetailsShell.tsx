import Link from "next/link";
import {
  ArrowLeft,
  Battery,
  Clock,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  Radio,
} from "lucide-react";
import type { Drone } from "@/lib/domain/types";
import { cn, formatBattery, formatFlightHours } from "@/lib/utils";
import { surface, border, badge, text } from "@/lib/theme";

interface DroneDetailsShellProps {
  drone: Drone;
  commandState: {
    lastCommand: string | null;
    lastCommandAt: string | null;
    armed: boolean;
    returning: boolean;
  } | null;
  children: React.ReactNode;
}

const statusConfig: Record<
  Drone["status"],
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  online: {
    label: "ONLINE",
    badgeClass: badge.online,
    icon: CheckCircle2,
  },
  "in-mission": {
    label: "IN MISSION",
    badgeClass: badge["in-mission"],
    icon: Activity,
  },
  charging: {
    label: "CHARGING",
    badgeClass: badge.charging,
    icon: Battery,
  },
  offline: {
    label: "OFFLINE",
    badgeClass: badge.offline,
    icon: XCircle,
  },
};

export function DroneDetailsShell({ drone, commandState, children }: DroneDetailsShellProps) {
  const config = statusConfig[drone.status];
  const StatusIcon = config.icon;
  const lastUpdated = new Date(drone.updatedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/fleet"
          className={cn("rounded-md p-2 transition-colors", surface.hover)}
          aria-label="Back to fleet"
        >
          <ArrowLeft size={20} className={text.muted} />
        </Link>
        <div className="flex-1">
          <h1 className={cn("text-2xl font-bold", text.primary)}>{drone.name}</h1>
          <p className={cn("text-sm", text.muted)}>ID: {drone.id}</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium",
            config.badgeClass
          )}
        >
          <StatusIcon size={14} />
          {config.label}
        </div>
      </div>

      {/* Profile Card */}
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Drone Profile</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className={cn("mb-1 flex items-center gap-2", text.muted)}>
              <Battery size={16} />
              <span className="text-sm">Battery</span>
            </div>
            <p className={cn("text-xl font-semibold", text.primary)}>
              {formatBattery(drone.batteryPct)}
            </p>
          </div>
          <div>
            <div className={cn("mb-1 flex items-center gap-2", text.muted)}>
              <Clock size={16} />
              <span className="text-sm">Flight Hours</span>
            </div>
            <p className={cn("text-xl font-semibold", text.primary)}>
              {formatFlightHours(drone.flightHours)}
            </p>
          </div>
          <div>
            <div className={cn("mb-1 flex items-center gap-2", text.muted)}>
              <MapPin size={16} />
              <span className="text-sm">Position</span>
            </div>
            <p className={cn("text-sm font-medium", text.primary)}>
              {drone.position.lat.toFixed(6)}, {drone.position.lng.toFixed(6)}
            </p>
            <p className={cn("text-xs", text.muted)}>Alt: {drone.position.alt}m</p>
          </div>
          <div>
            <div className={cn("mb-1 flex items-center gap-2", text.muted)}>
              <Activity size={16} />
              <span className="text-sm">Last Updated</span>
            </div>
            <p className={cn("text-sm font-medium", text.primary)}>
              {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Command State (DEV) */}
        {commandState && process.env.NODE_ENV === "development" && (
          <div className={cn("mt-6 border-t pt-6", border.default)}>
            <h3 className={cn("mb-3 text-sm font-medium", text.primary)}>Command State (DEV)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <span className={text.muted}>Armed:</span>
                <span
                  className={cn(
                    "ml-2 font-medium",
                    commandState.armed
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {commandState.armed ? "Yes" : "No"}
                </span>
                {commandState.armed && (
                  <Radio size={14} className="ml-1 inline text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <span className={text.muted}>Returning:</span>
                <span
                  className={cn(
                    "ml-2 font-medium",
                    commandState.returning ? "text-yellow-600 dark:text-yellow-400" : text.muted
                  )}
                >
                  {commandState.returning ? "Yes" : "No"}
                </span>
              </div>
              {commandState.lastCommand && (
                <div>
                  <span className={text.muted}>Last Command:</span>
                  <span className={cn("ml-2 font-medium", text.primary)}>
                    {commandState.lastCommand}
                  </span>
                </div>
              )}
              {commandState.lastCommandAt && (
                <div>
                  <span className={text.muted}>Command Time:</span>
                  <span className={cn("ml-2 text-xs font-medium", text.primary)}>
                    {new Date(commandState.lastCommandAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health Indicators */}
        <div className={cn("mt-6 border-t pt-6", border.default)}>
          <h3 className={cn("mb-3 text-sm font-medium", text.primary)}>Health Indicators</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "GPS Quality", value: drone.health.gpsQuality, color: "#4ade80" },
              { label: "Signal Strength", value: drone.health.signalStrength, color: "#60a5fa" },
              { label: "Motor Health", value: drone.health.motorHealth, color: "#fbbf24" },
              { label: "Overall", value: drone.health.overall, color: "#888" },
            ].map((indicator) => (
              <div key={indicator.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={cn("text-xs", text.muted)}>{indicator.label}</span>
                  <span className={cn("text-xs font-medium", text.primary)}>
                    {indicator.value}%
                  </span>
                </div>
                <div className={cn("h-2 overflow-hidden rounded-full", surface.subtle)}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${indicator.value}%`,
                      backgroundColor: indicator.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Children (Telemetry, Missions, Commands, Gallery) */}
      {children}
    </div>
  );
}

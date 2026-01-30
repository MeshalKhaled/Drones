"use client";

import Image from "next/image";
import Link from "next/link";
import { useGlobalUIStore } from "@/lib/stores/ui/globalUiStore";
import type { Drone } from "@/lib/domain/types";
import { cn, formatBattery, formatTimeAgo } from "@/lib/utils";

const statusConfig: Record<
  Drone["status"],
  { label: string; pillClass: string; glowClass: string }
> = {
  online: {
    label: "ONLINE",
    pillClass:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    glowClass: "shadow-[0_0_15px_rgba(34,197,94,0.1)]",
  },
  "in-mission": {
    label: "IN MISSION",
    pillClass:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    glowClass: "shadow-[0_0_15px_rgba(249,115,22,0.1)]",
  },
  charging: {
    label: "CHARGING",
    pillClass:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    glowClass: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
  },
  offline: {
    label: "OFFLINE",
    pillClass:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    glowClass: "shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  },
};

interface DroneCardProps {
  drone: Drone;
}

export function DroneCard({ drone }: DroneCardProps) {
  const config = statusConfig[drone.status];
  const lastFlightTime = formatTimeAgo(drone.updatedAt);
  const setSelectedDroneId = useGlobalUIStore((state) => state.setSelectedDroneId);

  const handleClick = () => {
    setSelectedDroneId(drone.id);
  };

  return (
    <Link
      href={`/drones/${drone.id}`}
      onClick={handleClick}
      className="group relative overflow-hidden rounded-md border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-zinc-900/50 dark:focus-visible:ring-offset-zinc-900"
      aria-label={`View details for ${drone.name}`}
    >
      {/* Drone Image Area */}
      <div className={cn("relative h-44 bg-zinc-50 dark:bg-zinc-800/50", config.glowClass)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative h-full w-full drop-shadow-2xl">
            <Image
              src="/droneImg.png"
              alt={drone.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority
            />
          </div>
        </div>

        {/* Status Pill Overlay */}
        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              "rounded border px-2 py-1 text-xs font-semibold backdrop-blur-sm",
              config.pillClass
            )}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-2 p-4">
        <h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {drone.name}
        </h3>
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Battery:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatBattery(drone.batteryPct)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Flight:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{lastFlightTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

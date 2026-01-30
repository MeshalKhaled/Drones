"use client";

import Link from "next/link";
import { VirtualTable } from "@/components/ui/VirtualTable";
import type { Drone } from "@/lib/domain/types";
import { cn, formatBattery, formatFlightHours, formatTimeAgo } from "@/lib/utils";

interface VirtualDroneMetricsTableProps {
  drones: Drone[];
}

const statusConfig: Record<
  Drone["status"],
  { label: string; pillClass: string; dotClass: string }
> = {
  online: {
    label: "Online",
    pillClass:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    dotClass: "bg-green-500",
  },
  "in-mission": {
    label: "In Mission",
    pillClass:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    dotClass: "bg-orange-500",
  },
  charging: {
    label: "Charging",
    pillClass:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  offline: {
    label: "Offline",
    pillClass:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    dotClass: "bg-red-500",
  },
};

function getBatteryColor(pct: number, status: Drone["status"]): string {
  if (status === "charging") return "bg-blue-500";
  if (pct >= 70) return "bg-green-500";
  if (pct >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export function VirtualDroneMetricsTable({ drones }: VirtualDroneMetricsTableProps) {
  const columns = [
    {
      key: "name",
      header: "Drone",
      width: 200,
      render: (drone: Drone) => {
        const config = statusConfig[drone.status];
        return (
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", config.dotClass)} aria-hidden="true" />
            <Link
              href={`/drones/${drone.id}`}
              className="font-medium text-zinc-900 transition-colors hover:text-blue-500 dark:text-zinc-100"
            >
              {drone.name}
            </Link>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      width: 140,
      render: (drone: Drone) => {
        const config = statusConfig[drone.status];
        return (
          <span className={cn("rounded border px-2 py-1 text-xs font-semibold", config.pillClass)}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "battery",
      header: "Battery",
      width: 180,
      render: (drone: Drone) => (
        <div className="flex items-center gap-2">
          <span className="min-w-[3rem] text-sm text-zinc-900 dark:text-zinc-100">
            {formatBattery(drone.batteryPct)}
          </span>
          <div className="h-1.5 max-w-[80px] flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={cn(
                "h-full transition-all",
                getBatteryColor(drone.batteryPct, drone.status)
              )}
              style={{ width: `${drone.batteryPct}%` }}
              aria-label={`Battery level: ${drone.batteryPct}%`}
            />
          </div>
        </div>
      ),
    },
    {
      key: "flightHours",
      header: "Flight Hours",
      width: 140,
      render: (drone: Drone) => (
        <span className="text-sm text-zinc-900 dark:text-zinc-100">
          {formatFlightHours(drone.flightHours)}
        </span>
      ),
    },
    {
      key: "lastMission",
      header: "Last Mission",
      width: 150,
      render: (drone: Drone) => (
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatTimeAgo(drone.updatedAt)}
        </span>
      ),
    },
  ];

  // Use virtualization only if 50+ rows, otherwise use regular table
  const useVirtualization = drones.length >= 50;

  if (!useVirtualization) {
    // Fallback to regular table for small datasets
    return (
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Drone metrics">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drones.map((drone) => (
                <tr
                  key={drone.id}
                  className="border-b border-zinc-200/50 transition-colors hover:bg-zinc-50/30 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render(drone)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <VirtualTable
      columns={columns}
      data={drones}
      rowHeight={48}
      headerHeight={40}
      ariaLabel="Drone metrics"
    />
  );
}

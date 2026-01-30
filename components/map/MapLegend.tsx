"use client";

import { cn } from "@/lib/utils";
import { surface, border, text } from "@/lib/theme";

export function MapLegend() {
  const statuses = [
    { label: "Online", color: "#4ade80" },
    { label: "In Mission", color: "#60a5fa" },
    { label: "Charging", color: "#fbbf24" },
    { label: "Offline", color: "#f87171" },
  ];

  return (
    <div
      className={cn(
        "absolute bottom-4 left-4 z-40 rounded-md border p-3 shadow-lg",
        surface.base,
        border.default
      )}
    >
      <h3 className={cn("mb-2 text-xs font-semibold uppercase tracking-wider", text.muted)}>
        Status
      </h3>
      <div className="space-y-2">
        {statuses.map((status) => (
          <div key={status.label} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full border-2 border-zinc-900 dark:border-white"
              style={{ backgroundColor: status.color }}
            />
            <span className={cn("text-xs", text.primary)}>{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeRange } from "@/lib/domain/analytics";

const timeRanges: Array<{ value: TimeRange; label: string }> = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export function AnalyticsHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = (searchParams.get("range") || "7d") as TimeRange;

  const handleRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`/analytics?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Fleet performance and insights
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
        <Calendar size={16} className="ml-2 text-zinc-500 dark:text-zinc-400" />
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              currentRange === range.value
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
            )}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

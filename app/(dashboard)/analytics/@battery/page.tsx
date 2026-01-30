import { Suspense } from "react";
import { BatteryHealthChart } from "@/components/analytics/BatteryHealthChart";
import { aggregateBatteryHealth, type TimeRange } from "@/lib/domain/analytics";

interface BatterySlotProps {
  searchParams: Promise<{ range?: string }>;
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 h-6 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-[300px] rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

export default async function BatterySlot({ searchParams }: BatterySlotProps) {
  const params = await searchParams;
  const range = (params.range || "7d") as TimeRange;
  const data = await aggregateBatteryHealth(range);

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <BatteryHealthChart data={data} />
    </Suspense>
  );
}

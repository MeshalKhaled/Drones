import { Suspense } from "react";
import { MissionSuccessChart } from "@/components/analytics/MissionSuccessChart";
import { aggregateMissionSuccess } from "@/lib/domain/analytics";

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 h-6 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-[300px] rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

export default async function MissionsDefault() {
  const data = await aggregateMissionSuccess("7d");

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <MissionSuccessChart data={data} />
    </Suspense>
  );
}

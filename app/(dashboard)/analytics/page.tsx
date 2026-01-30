import { Suspense } from "react";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { FlightHoursCard } from "@/components/analytics/FlightHoursCard";
import { aggregateFlightHours, type TimeRange } from "@/lib/domain/analytics";

/**
 * R-157: Analytics Page with Parallel Routes
 *
 * This page renders the header and summary cards.
 * The charts (@battery, @missions, @activity) are rendered via parallel routes
 * in layout.tsx, enabling independent streaming and simultaneous data fetching.
 */
interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

function FlightHoursSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800" />
        <div className="flex-1">
          <div className="mb-2 h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-8 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const range = (params.range || "7d") as TimeRange;
  const flightHoursData = await aggregateFlightHours(range);

  return (
    <>
      <AnalyticsHeader />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<FlightHoursSkeleton />}>
          <FlightHoursCard data={flightHoursData} />
        </Suspense>
      </div>
    </>
  );
}

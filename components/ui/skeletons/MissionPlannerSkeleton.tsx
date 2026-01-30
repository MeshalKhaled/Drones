import { Skeleton } from "../Skeleton";

export function MissionPlannerSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Map */}
      <div className="relative min-h-[400px] flex-1 rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
        <Skeleton className="absolute inset-0 rounded-md" variant="rectangular" />
        {/* Map controls */}
        <div className="absolute right-4 top-4 z-10 space-y-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Panel */}
      <div className="w-full space-y-4 lg:w-96">
        <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 rounded-md" />
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

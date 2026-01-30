import { Skeleton } from "../Skeleton";

export function MapSkeleton() {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-zinc-100 dark:bg-zinc-950">
      {/* Map skeleton */}
      <Skeleton className="absolute inset-0" variant="rectangular" />

      {/* Controls skeleton */}
      <div className="absolute left-4 top-4 z-10 space-y-2">
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      {/* Legend skeleton */}
      <div className="absolute bottom-4 left-4 z-10 w-48 space-y-2 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="h-4 w-24" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" variant="circular" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

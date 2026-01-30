import { Skeleton } from "../Skeleton";

export function DroneCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Image Area */}
      <div className="relative h-44 bg-zinc-50 dark:bg-zinc-800/50">
        <Skeleton className="h-full w-full" variant="rectangular" />
        {/* Status Pill */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </div>
      {/* Content */}
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

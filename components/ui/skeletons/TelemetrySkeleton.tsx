import { Skeleton } from "../Skeleton";

export function TelemetrySkeleton() {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <Skeleton className="mb-4 h-6 w-32" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

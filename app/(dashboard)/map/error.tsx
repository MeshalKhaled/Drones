"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Map page error:", error);
    Sentry.captureException(error, { tags: { page: "map" } });
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
      <AlertCircle className="text-red-500" size={48} aria-hidden="true" />
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Map failed to load</h2>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          {error.message || "An unexpected error occurred while loading the map."}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        aria-label="Retry loading map"
      >
        <RefreshCw size={18} aria-hidden="true" />
        <span>Try again</span>
      </button>
    </div>
  );
}

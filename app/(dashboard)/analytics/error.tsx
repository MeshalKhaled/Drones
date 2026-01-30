"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Analytics page error:", error);
    Sentry.captureException(error, { tags: { page: "analytics" } });
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="max-w-md space-y-4 rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error.message || "An error occurred while loading analytics data"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

export default function FleetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    logger.error("Fleet page error:", error);
    // Capture in Sentry
    Sentry.captureException(error, {
      tags: { page: "fleet" },
    });
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <AlertCircle className="text-destructive" size={48} aria-hidden="true" />
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="max-w-md text-muted-foreground">
          {error.message || "An unexpected error occurred while loading the fleet data."}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        aria-label="Retry loading fleet data"
      >
        <RefreshCw size={18} aria-hidden="true" />
        <span>Try again</span>
      </button>
    </div>
  );
}

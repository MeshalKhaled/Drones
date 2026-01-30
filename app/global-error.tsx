"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md space-y-6 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                An unexpected error occurred. Our team has been notified.
              </p>
              {error.digest && (
                <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <RefreshCw size={18} />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

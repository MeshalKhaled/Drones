"use client";

import { useEffect, useState } from "react";

/**
 * Hook to get an adaptive polling interval that increases when tab is inactive
 * Production best practice: reduce server load when user isn't actively viewing
 */
export function useAdaptivePolling(baseInterval: number = 2000): number {
  const [interval, setInterval] = useState(baseInterval);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is inactive: increase interval to reduce load
        setInterval(baseInterval * 3); // 3x slower when inactive
      } else {
        // Tab is active: use normal interval
        setInterval(baseInterval);
      }
    };

    // Set initial state
    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [baseInterval]);

  return interval;
}

/**
 * Get a refetchInterval function for React Query that adapts to tab visibility
 * Usage: refetchInterval: (query) => getAdaptiveRefetchInterval(2000)
 */
export function getAdaptiveRefetchInterval(baseInterval: number): number | false {
  if (typeof window === "undefined") {
    return baseInterval;
  }

  // Increase interval when tab is inactive
  return document.hidden ? baseInterval * 3 : baseInterval;
}

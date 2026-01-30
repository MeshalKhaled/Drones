"use client";

import { useQuery } from "@tanstack/react-query";
import type { Mission } from "@/lib/domain/types";

/**
 * Hook to fetch the active mission for a specific drone
 * Production-optimized: 3s polling (was 1s), adapts to tab visibility
 */
export function useActiveMission(droneId: string | null) {
  return useQuery<Mission | null>({
    queryKey: ["active-mission", droneId],
    queryFn: async () => {
      if (!droneId) return null;

      const response = await fetch(`/api/drones/${droneId}/mission`);
      if (!response.ok) {
        // Handle connection refused gracefully
        if (response.status === 0 || response.status >= 500) {
          throw new Error("Server unavailable - please check your connection");
        }
        throw new Error("Failed to fetch active mission");
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!droneId,
    // Reduced polling: mission status changes are detected via telemetry activeMissionStatus
    refetchInterval: typeof window !== "undefined" && document.hidden ? 20000 : 10000, // 10s active, 20s inactive
    staleTime: 5000, // 5s - mission status can change but telemetry also provides updates
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    retry: 2, // Reduced retries for faster failure detection
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

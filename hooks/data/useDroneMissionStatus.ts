"use client";

import { useQuery } from "@tanstack/react-query";

export interface DroneMissionStatus {
  hasActiveMission: boolean;
  activeMissionId: string | null;
  currentWaypointIndex: number | null;
  totalWaypoints: number | null;
  missionStatus: string | null;
}

export type DroneMissionStatusMap = Record<string, DroneMissionStatus>;

/**
 * Hook to fetch mission status for all drones
 */
export function useDroneMissionStatus() {
  return useQuery<DroneMissionStatusMap>({
    queryKey: ["drone-mission-status"],
    queryFn: async () => {
      const response = await fetch("/api/drones/missions-status");
      if (!response.ok) {
        // Handle connection errors gracefully
        if (response.status === 0 || response.status >= 500) {
          throw new Error("Server unavailable - please check your connection");
        }
        throw new Error("Failed to fetch drone mission status");
      }
      const json = await response.json();
      return json.data;
    },
    refetchInterval: typeof window !== "undefined" && document.hidden ? 9000 : 3000, // 3s active, 9s inactive
    staleTime: 2000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

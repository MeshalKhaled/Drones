"use client";

import { useQuery } from "@tanstack/react-query";

export interface DroneData {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: string;
  batteryPct: number;
  flightHours: number;
  lastMission: string | null;
  position: { lat: number; lng: number; alt: number; speed: number };
  health: { signalStrength: number; gpsQuality: number; motorHealth: number; overall: number };
  armed: boolean;
  activeMissionId: string | null;
  updatedAt: string;
}

/**
 * Hook to fetch drone data by ID
 */
export function useDrone(droneId: string | null) {
  return useQuery<DroneData | null>({
    queryKey: ["drone", droneId],
    queryFn: async () => {
      if (!droneId) return null;

      const response = await fetch(`/api/drones/${droneId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch drone");
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!droneId,
    refetchInterval: false, // No polling - profile data is static
    staleTime: 600000, // 10 minutes - profile data rarely changes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: true, // Only refetch when component mounts (droneId changes)
  });
}

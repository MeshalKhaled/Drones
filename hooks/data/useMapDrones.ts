"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { ApiResponseSchema, DroneSchema } from "@/lib/domain/types";

/**
 * Lightweight drone profiles for map (batched, not per-drone)
 * Fetches static profile fields needed by map UI
 */
export function useMapDrones() {
  return useQuery({
    queryKey: ["drones", "map"],
    queryFn: async () => {
      const result = await apiGet(
        "/api/drones",
        ApiResponseSchema(DroneSchema.array()),
        { scope: "map" }
      );
      return result;
    },
    staleTime: 60000, // 60s - profiles are relatively static
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchInterval: false, // No polling - profiles don't change frequently
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { ApiResponseSchema, MissionSchema } from "@/lib/domain/types";

interface UseMissionsPollingOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useMissionsPolling(options: UseMissionsPollingOptions = {}) {
  const { enabled = true, refetchInterval = 5000 } = options;

  return useQuery({
    queryKey: ["missions", "active"],
    queryFn: () =>
      apiGet("/api/missions", ApiResponseSchema(MissionSchema.array()), { status: "in-progress" }),
    enabled,
    refetchInterval,
    staleTime: 2000,
  });
}

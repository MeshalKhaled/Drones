"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { VirtualTable } from "@/components/ui/VirtualTable";
import { mockDrones } from "@/services/mock-data";
import { startMissionAction, cancelMissionAction } from "@/app/actions/missions";
import { apiGet } from "@/lib/api";
import { ApiResponseSchema, MissionSchema } from "@/lib/domain/types";
import type { Mission } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { getMissionReason, getMissionReasonLabel } from "@/lib/utils/mission-reasons";
import { toast } from "sonner";
import { Play, Loader2, X } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

interface VirtualMissionsTableProps {
  missions: Mission[];
  currentPage: number;
  totalPages: number;
  total: number;
  searchParams?: Record<string, string>;
}

function MissionStatusBadge({ status }: { status: Mission["status"] }) {
  const config = {
    pending: {
      label: "Pending",
      className:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30",
    },
    "in-progress": {
      label: "In Progress",
      className:
        "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    },
    completed: {
      label: "Completed",
      className:
        "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30",
    },
    failed: {
      label: "Failed",
      className:
        "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-zinc-100 dark:bg-zinc-900/20 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/30",
    },
  };

  const { label, className } = config[status];

  return (
    <span className={cn("rounded-md border px-2 py-1 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

function calculateDuration(startTime: string | null, endTime: string | null): string {
  if (!startTime || !endTime) return "—";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function VirtualMissionsTable({
  missions,
  currentPage,
  totalPages,
  total,
  searchParams = {},
}: VirtualMissionsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [startingMissionId, setStartingMissionId] = useState<string | null>(null);
  const [cancellingMissionId, setCancellingMissionId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<{ missionId: string; missionName: string } | null>(null);
  const [droneActiveMissions, setDroneActiveMissions] = useState<Map<string, string>>(new Map());

  // Fetch active missions to check drone availability
  const { data: activeMissionsResponse } = useQuery({
    queryKey: ["missions", "active"],
    queryFn: async () => {
      try {
        return await apiGet("/api/missions", ApiResponseSchema(MissionSchema.array()), {
          status: "in-progress",
        });
      } catch {
        return { data: [] };
      }
    },
    refetchInterval: 5000,
  });

  // Update drone active missions map
  useEffect(() => {
    const activeMissions = activeMissionsResponse?.data || [];
    const map = new Map<string, string>();
    activeMissions.forEach((m: Mission) => {
      if (m.status === "in-progress") {
        map.set(m.droneId, m.id);
      }
    });
    setDroneActiveMissions(map);
  }, [activeMissionsResponse]);

  const buildPaginationUrl = (page: number): string => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });
    params.set("page", String(page));
    return `/missions?${params.toString()}`;
  };

  const handleStartMission = async (missionId: string) => {
    setStartingMissionId(missionId);
    try {
      const result = await startMissionAction(missionId);
      if (result.success) {
        toast.success("Mission started successfully");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["missions"] });
        queryClient.invalidateQueries({ queryKey: ["drones"] });
        queryClient.invalidateQueries({ queryKey: ["telemetry"] });
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to start mission");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start mission");
    } finally {
      setStartingMissionId(null);
    }
  };

  const handleCancelMission = async (missionId: string) => {
    setCancellingMissionId(missionId);
    try {
      const result = await cancelMissionAction(missionId);
      if (result.success) {
        toast.success("Mission cancelled successfully");
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["missions"] });
        queryClient.invalidateQueries({ queryKey: ["drones"] });
        queryClient.invalidateQueries({ queryKey: ["telemetry"] });
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to cancel mission");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel mission");
    } finally {
      setCancellingMissionId(null);
      setConfirmCancel(null);
    }
  };

  // Check if drone has active mission
  const getDroneActiveMissionId = (droneId: string): string | null => {
    return droneActiveMissions.get(droneId) || null;
  };

  const columns = [
    {
      key: "id",
      header: "Mission ID",
      width: 120,
      render: (mission: Mission) => (
        <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
          {mission.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: "drone",
      header: "Drone",
      width: 150,
      render: (mission: Mission) => {
        const drone = mockDrones.find((d) => d.id === mission.droneId);
        return drone ? (
          <Link
            href={`/drones/${drone.id}`}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {drone.name}
          </Link>
        ) : (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Unknown</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      width: 180,
      render: (mission: Mission) => {
        const reason = getMissionReason(mission);
        return (
          <div className="flex flex-col gap-1">
            <MissionStatusBadge status={mission.status} />
            {(mission.status === "failed" || mission.status === "cancelled") && reason && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400" title={getMissionReasonLabel(reason)}>
                {getMissionReasonLabel(reason)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "startTime",
      header: "Start Time",
      width: 180,
      render: (mission: Mission) => {
        const startDate = mission.startTime ? new Date(mission.startTime) : null;
        return startDate ? (
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
          </span>
        ) : (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">—</span>
        );
      },
    },
    {
      key: "endTime",
      header: "End Time",
      width: 180,
      render: (mission: Mission) => {
        const endDate = mission.endTime ? new Date(mission.endTime) : null;
        return endDate ? (
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}
          </span>
        ) : (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">—</span>
        );
      },
    },
    {
      key: "duration",
      header: "Duration",
      width: 100,
      render: (mission: Mission) => (
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {calculateDuration(mission.startTime, mission.endTime)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: 120,
      render: (mission: Mission) => {
        const activeMissionId = getDroneActiveMissionId(mission.droneId);
        const isDroneBusy = activeMissionId !== null && activeMissionId !== mission.id;
        const isStarting = startingMissionId === mission.id;
        const canStart = mission.status === "pending" && !isDroneBusy;

        if (mission.status === "pending") {
          const isCancelling = cancellingMissionId === mission.id;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartMission(mission.id)}
                disabled={!canStart || isStarting}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  canStart && !isStarting
                    ? "bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                )}
                title={isDroneBusy ? "Drone already has an active mission" : "Start mission"}
              >
                {isStarting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={() => setConfirmCancel({ missionId: mission.id, missionName: mission.id.slice(0, 8) })}
                disabled={isCancelling}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  "bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                )}
                title="Cancel mission"
              >
                {isCancelling ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <X size={12} />
                )}
              </button>
            </div>
          );
        }

        if (mission.status === "in-progress") {
          const currentIndex = mission.currentWaypointIndex ?? 0;
          const totalWaypoints = mission.waypoints.length;
          const progress =
            totalWaypoints > 0 ? Math.round(((currentIndex + 1) / totalWaypoints) * 100) : 0;
          const isCancelling = cancellingMissionId === mission.id;
          return (
            <div className="flex items-center gap-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <div>
                  Waypoint {currentIndex + 1}/{totalWaypoints}
                </div>
                <div className="text-blue-600 dark:text-blue-400">{progress}%</div>
              </div>
              <button
                onClick={() => setConfirmCancel({ missionId: mission.id, missionName: mission.id.slice(0, 8) })}
                disabled={isCancelling}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  "bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                )}
                title="Cancel mission"
              >
                {isCancelling ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <X size={12} />
                )}
              </button>
            </div>
          );
        }

        if (mission.status === "completed" && mission.completedAt) {
          return (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(mission.completedAt).toLocaleTimeString()}
            </span>
          );
        }

        return <span className="text-xs text-zinc-500 dark:text-zinc-400">—</span>;
      },
    },
  ];

  if (missions.length === 0) {
    return (
      <div className="rounded-md border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          No missions found
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Try adjusting your filters or create a new mission.
        </p>
      </div>
    );
  }

  // Use virtualization only if 50+ rows, otherwise use regular table
  const useVirtualization = missions.length >= 50;

  if (!useVirtualization) {
    // Fallback to regular table for small datasets
    return (
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Missions list">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {missions.map((mission) => (
                <tr
                  key={mission.id}
                  className="border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render(mission)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)} of {total}{" "}
              missions
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={currentPage > 1 ? buildPaginationUrl(currentPage - 1) : "#"}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  currentPage > 1
                    ? "border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    : "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                )}
                aria-disabled={currentPage === 1}
              >
                Previous
              </Link>
              <span className="px-2 text-sm text-zinc-500 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={currentPage < totalPages ? buildPaginationUrl(currentPage + 1) : "#"}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  currentPage < totalPages
                    ? "border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    : "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                )}
                aria-disabled={currentPage === totalPages}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <VirtualTable
        columns={columns}
        data={missions}
        rowHeight={48}
        headerHeight={40}
        ariaLabel="Missions list"
      />

      {/* Cancel confirmation dialog */}
      <ConfirmationDialog
        isOpen={!!confirmCancel}
        onCancel={() => setConfirmCancel(null)}
        onConfirm={() => {
          if (confirmCancel) {
            handleCancelMission(confirmCancel.missionId);
          }
        }}
        variant="danger"
        title="Cancel Mission"
        message={`Are you sure you want to cancel mission ${confirmCancel?.missionName}? This action cannot be undone.`}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-b-md border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)} of {total}{" "}
            missions
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={currentPage > 1 ? buildPaginationUrl(currentPage - 1) : "#"}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                currentPage > 1
                  ? "border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  : "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
              )}
              aria-disabled={currentPage === 1}
            >
              Previous
            </Link>
            <span className="px-2 text-sm text-zinc-500 dark:text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={currentPage < totalPages ? buildPaginationUrl(currentPage + 1) : "#"}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                currentPage < totalPages
                  ? "border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  : "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
              )}
              aria-disabled={currentPage === totalPages}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

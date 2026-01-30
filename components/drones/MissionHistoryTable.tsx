import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { Mission } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { getMissionReason, getMissionReasonLabel } from "@/lib/utils/mission-reasons";
import { surface, border, text, badge } from "@/lib/theme";

interface MissionHistoryTableProps {
  missions: Mission[];
  droneId: string;
  currentPage: number;
  totalPages: number;
}

function MissionStatusBadge({ status }: { status: Mission["status"] }) {
  const config = {
    pending: badge.pending,
    "in-progress": badge["in-progress"],
    completed: badge.completed,
    failed: badge.failed,
    cancelled: badge.cancelled,
  };

  const labels = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return (
    <span className={cn("rounded-md border px-2 py-1 text-xs font-medium", config[status])}>
      {labels[status]}
    </span>
  );
}

function calculateDistance(waypoints: Mission["waypoints"]): number {
  if (waypoints.length < 2) return 0;

  // Simplified distance calculation (Haversine)
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    if (!wp1 || !wp2) continue;
    const R = 6371000; // Earth radius in meters
    const dLat = ((wp2.lat - wp1.lat) * Math.PI) / 180;
    const dLng = ((wp2.lng - wp1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((wp1.lat * Math.PI) / 180) *
        Math.cos((wp2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return total;
}

export function MissionHistoryTable({
  missions,
  droneId,
  currentPage,
  totalPages,
}: MissionHistoryTableProps) {
  if (missions.length === 0) {
    return (
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Mission History</h2>
        <div className="py-12 text-center">
          <AlertCircle className={cn("mx-auto mb-4 h-12 w-12 opacity-50", text.muted)} />
          <p className={cn("text-sm", text.muted)}>No missions found for this drone</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border p-6", surface.base, border.default)}>
      <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Mission History</h2>
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Mission history for drone">
          <thead>
            <tr className={cn("border-b", border.default)}>
              <th scope="col" className={cn("px-4 py-3 text-left text-sm font-medium", text.muted)}>
                Mission ID
              </th>
              <th scope="col" className={cn("px-4 py-3 text-left text-sm font-medium", text.muted)}>
                Status
              </th>
              <th scope="col" className={cn("px-4 py-3 text-left text-sm font-medium", text.muted)}>
                Start
              </th>
              <th scope="col" className={cn("px-4 py-3 text-left text-sm font-medium", text.muted)}>
                End
              </th>
              <th scope="col" className={cn("px-4 py-3 text-left text-sm font-medium", text.muted)}>
                Success
              </th>
              <th scope="col" className={cn("px-4 py-3 text-left text-sm font-medium", text.muted)}>
                Distance
              </th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => {
              const startDate = mission.startTime ? new Date(mission.startTime) : null;
              const endDate = mission.endTime ? new Date(mission.endTime) : null;
              const distance = calculateDistance(mission.waypoints);

              return (
                <tr
                  key={mission.id}
                  className={cn("border-b transition-colors", border.default, surface.hover)}
                >
                  <td className="px-4 py-3">
                    <span className={cn("font-mono text-sm", text.primary)}>
                      {mission.id.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <MissionStatusBadge status={mission.status} />
                      {(mission.status === "failed" || mission.status === "cancelled") && (() => {
                        const reason = getMissionReason(mission);
                        return reason ? (
                          <span className={cn("text-xs", text.muted)} title={getMissionReasonLabel(reason)}>
                            {getMissionReasonLabel(reason)}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </td>
                  <td className={cn("px-4 py-3 text-sm", text.primary)}>
                    {startDate ? (
                      <>
                        {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
                      </>
                    ) : (
                      <span className={text.muted}>—</span>
                    )}
                  </td>
                  <td className={cn("px-4 py-3 text-sm", text.primary)}>
                    {endDate ? (
                      <>
                        {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}
                      </>
                    ) : (
                      <span className={text.muted}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {mission.success ? (
                      <CheckCircle2 size={16} className="text-green-500" aria-label="Success" />
                    ) : (
                      <XCircle size={16} className="text-red-500" aria-label="Failed" />
                    )}
                  </td>
                  <td className={cn("px-4 py-3 text-sm", text.primary)}>
                    {(distance / 1000).toFixed(2)} km
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={cn("mt-4 flex items-center justify-between border-t pt-4", border.default)}>
          <p className={cn("text-sm", text.muted)}>
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/drones/${droneId}?page=${currentPage - 1}`}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  surface.subtle,
                  border.default,
                  surface.hover,
                  text.primary
                )}
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/drones/${droneId}?page=${currentPage + 1}`}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  surface.subtle,
                  border.default,
                  surface.hover,
                  text.primary
                )}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

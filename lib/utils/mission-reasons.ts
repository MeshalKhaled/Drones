import type { MissionFailureReason, Mission } from "@/lib/domain/types";

/**
 * Get mission reason (failure or cancellation) with fallback
 */
export function getMissionReason(mission: Mission): MissionFailureReason | null {
  return mission.failureReason ?? null;
}

/**
 * Maps mission failure/cancellation reasons to user-friendly labels
 */
export function getMissionReasonLabel(reason: MissionFailureReason | undefined | null): string {
  if (!reason) return "";

  const labels: Record<MissionFailureReason, string> = {
    LOW_BATTERY: "Low battery",
    LOW_GPS: "Low GPS quality",
    OFFLINE_TIMEOUT: "Drone offline too long",
    RTL_CANCELLED: "Cancelled by RTL",
    CANCELLED_BY_USER: "Cancelled by user",
  };

  return labels[reason] || reason;
}

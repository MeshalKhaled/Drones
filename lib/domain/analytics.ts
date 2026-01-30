import type { Drone, Mission } from "@/lib/domain/types";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockDrones, mockMissions } = require("@/services/mock-data");

export type TimeRange = "24h" | "7d" | "30d";

export interface FlightHoursData {
  total: number;
  byDrone: Array<{
    droneId: string;
    droneName: string;
    hours: number;
  }>;
}

export interface BatteryHealthData {
  timestamps: string[];
  averages: number[];
  byDrone: Array<{
    droneId: string;
    droneName: string;
    data: Array<{
      timestamp: string;
      battery: number;
    }>;
  }>;
}

export interface MissionSuccessData {
  successRate: number;
  total: number;
  successful: number;
  failed: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface ActiveInactiveData {
  active: number;
  inactive: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
}

function getTimeRangeMs(range: TimeRange): number {
  switch (range) {
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return 30 * 24 * 60 * 60 * 1000;
  }
}

export function aggregateFlightHours(range: TimeRange): FlightHoursData {
  const now = Date.now();
  const rangeMs = getTimeRangeMs(range);
  const cutoff = now - rangeMs;

  // Filter missions within range
  const missionsInRange = (mockMissions as Mission[]).filter((m) => {
    const missionTime = new Date(m.createdAt).getTime();
    return missionTime >= cutoff;
  });

  // Calculate flight hours per drone from missions
  const droneHours = new Map<string, { name: string; hours: number }>();

  missionsInRange.forEach((mission) => {
    if (mission.status === "completed" && mission.droneId) {
      const existing = droneHours.get(mission.droneId) || {
        name: "",
        hours: 0,
      };
      // Estimate flight time: distance / average speed (simplified)
      const waypoints = mission.waypoints;
      let totalDistance = 0;
      for (let i = 1; i < waypoints.length; i++) {
        const prev = waypoints[i - 1];
        const curr = waypoints[i];
        if (!prev || !curr) continue;
        const lat1 = prev.lat;
        const lng1 = prev.lng;
        const lat2 = curr.lat;
        const lng2 = curr.lng;
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDistance += R * c;
      }
      // Average speed ~20 m/s, convert to hours
      const hours = totalDistance / (20 * 3600);
      existing.hours += hours;
      const drone = (mockDrones as Drone[]).find((d) => d.id === mission.droneId);
      if (drone) {
        existing.name = drone.name;
      }
      droneHours.set(mission.droneId, existing);
    }
  });

  // Also include base flight hours from drone profiles (only for drones that have missions)
  // This provides a baseline for drones that have completed missions in the range
  (mockDrones as Drone[]).forEach((drone) => {
    // Only add base hours if drone has completed missions in range
    const hasCompletedMissions = Array.from(droneHours.keys()).includes(drone.id);
    if (hasCompletedMissions) {
      const existing = droneHours.get(drone.id) || { name: drone.name, hours: 0 };
      // Add a small portion of base flight hours as baseline (10% of total)
      const baseHours = drone.flightHours * 0.1;
      existing.hours += baseHours;
      droneHours.set(drone.id, existing);
    }
  });

  const byDrone = Array.from(droneHours.entries()).map(([droneId, data]) => ({
    droneId,
    droneName: data.name || "Unknown",
    hours: data.hours,
  }));

  const total = byDrone.reduce((sum, d) => sum + d.hours, 0);

  return {
    total,
    byDrone,
  };
}

export function aggregateBatteryHealth(range: TimeRange): BatteryHealthData {
  const now = Date.now();
  const rangeMs = getTimeRangeMs(range);

  // Generate timestamps (one per day for simplicity)
  const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
  const timestamps: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ts = new Date(now - i * (rangeMs / days));
    timestamps.push(ts.toISOString());
  }

  // Calculate averages and per-drone data
  const averages: number[] = [];
  const byDrone: BatteryHealthData["byDrone"] = [];

  timestamps.forEach((timestamp) => {
    const timestampMs = new Date(timestamp).getTime();
    let sum = 0;
    let count = 0;

    (mockDrones as Drone[]).forEach((drone) => {
      // Simulate historical battery levels (going forward from past to present)
      // For historical data, simulate that battery was higher in the past
      const timeDiff = now - timestampMs; // How far in the past this timestamp is
      const hoursAgo = timeDiff / (1000 * 60 * 60);
      
      // Simulate battery was higher in the past (recharge over time)
      // For charging drones, simulate faster recharge
      const rechargeRate = drone.status === "charging" ? 2.0 : 0.5; // % per hour
      const simulatedBattery = Math.min(100, drone.batteryPct + (hoursAgo * rechargeRate));
      
      sum += simulatedBattery;
      count++;

      const droneEntry = byDrone.find((d) => d.droneId === drone.id);
      if (!droneEntry) {
        byDrone.push({
          droneId: drone.id,
          droneName: drone.name,
          data: [],
        });
      }
      const entry = byDrone.find((d) => d.droneId === drone.id);
      if (entry) {
        entry.data.push({
          timestamp,
          battery: simulatedBattery,
        });
      }
    });

    averages.push(count > 0 ? sum / count : 0);
  });

  return {
    timestamps,
    averages,
    byDrone,
  };
}

export function aggregateMissionSuccess(range: TimeRange): MissionSuccessData {
  const now = Date.now();
  const rangeMs = getTimeRangeMs(range);
  const cutoff = now - rangeMs;

  const missionsInRange = (mockMissions as Mission[]).filter((m) => {
    const missionTime = new Date(m.createdAt).getTime();
    return missionTime >= cutoff;
  });

  const successful = missionsInRange.filter((m) => m.status === "completed").length;
  const failed = missionsInRange.filter((m) => m.status === "failed").length;
  const total = missionsInRange.length;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  const statusCounts = new Map<string, number>();
  missionsInRange.forEach((m) => {
    statusCounts.set(m.status, (statusCounts.get(m.status) || 0) + 1);
  });

  const byStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    successRate,
    total,
    successful,
    failed,
    byStatus,
  };
}

export function aggregateActiveInactive(): ActiveInactiveData {
  const activeStatuses = ["online", "in-mission"];
  const inactiveStatuses = ["offline", "charging"];

  const statusCounts = new Map<string, number>();
  (mockDrones as Drone[]).forEach((drone) => {
    statusCounts.set(drone.status, (statusCounts.get(drone.status) || 0) + 1);
  });

  let active = 0;
  let inactive = 0;

  statusCounts.forEach((count, status) => {
    if (activeStatuses.includes(status)) {
      active += count;
    } else if (inactiveStatuses.includes(status)) {
      inactive += count;
    }
  });

  const byStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    active,
    inactive,
    byStatus,
  };
}

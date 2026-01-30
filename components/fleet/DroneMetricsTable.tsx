"use client";

import { VirtualDroneMetricsTable } from "./VirtualDroneMetricsTable";
import type { Drone } from "@/lib/domain/types";

interface DroneMetricsTableProps {
  drones: Drone[];
}

// Client Component wrapper - delegates to VirtualDroneMetricsTable
export function DroneMetricsTable(props: DroneMetricsTableProps) {
  return <VirtualDroneMetricsTable {...props} />;
}

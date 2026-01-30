import { Suspense } from "react";
import type { Drone } from "@/lib/domain/types";
import { FleetClient } from "@/components/fleet/FleetClient";
import FleetLoading from "./loading";
import { listDronesWithState } from "@/lib/stores/drone-store";

// Server Component: Use merged data for initial render
// React Query will handle real-time updates on the client
function getInitialDrones(): Drone[] {
  const dronesWithState = listDronesWithState();
  return dronesWithState.map((d) => ({
    id: d.profile.id,
    name: d.profile.name,
    status: d.runtime.status,
    batteryPct: d.runtime.batteryPct,
    flightHours: d.profile.flightHours,
    lastMission: d.profile.lastMission,
    updatedAt: d.runtime.updatedAt,
    position: d.runtime.position,
    health: d.profile.health,
  }));
}

function calculateStatusCounts(drones: Drone[]) {
  return {
    online: drones.filter((d) => d.status === "online").length,
    "in-mission": drones.filter((d) => d.status === "in-mission").length,
    charging: drones.filter((d) => d.status === "charging").length,
    offline: drones.filter((d) => d.status === "offline").length,
  };
}

export default async function FleetPage() {
  const initialDrones = await getInitialDrones();
  const initialCounts = calculateStatusCounts(initialDrones);

  return (
    <div className="space-y-6">
      <Suspense fallback={<FleetLoading />}>
        <FleetClient initialDrones={initialDrones} initialCounts={initialCounts} />
      </Suspense>
    </div>
  );
}

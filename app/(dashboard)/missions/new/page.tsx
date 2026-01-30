import { Suspense } from "react";
import dynamic from "next/dynamic";
import { mockDrones } from "@/services/mock-data";
import MissionPlannerLoading from "./loading";

// Dynamically import MissionPlannerClient with no SSR
const MissionPlannerClient = dynamic(
  () =>
    import("@/components/mission/MissionPlannerClient").then((mod) => ({
      default: mod.MissionPlannerClient,
    })),
  {
    ssr: false,
    loading: () => <MissionPlannerLoading />,
  }
);

function getMapboxToken(): string | null {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || null;
}

export default function NewMissionPage() {
  const mapboxToken = getMapboxToken();

  // Get available drones (online or in-mission)
  const availableDrones = mockDrones
    .filter((drone) => drone.status === "online" || drone.status === "in-mission")
    .map((drone) => ({
      id: drone.id,
      name: drone.name,
    }));

  if (!mapboxToken) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md space-y-4 rounded-lg border border-[#1a1a1c] bg-[#141416] p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">Mapbox token missing</h3>
          <p className="text-sm text-muted-foreground">
            Please configure NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file to use the mission
            planner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">New Mission</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan a new mission by adding waypoints on the map
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Suspense fallback={<MissionPlannerLoading />}>
          <MissionPlannerClient mapboxToken={mapboxToken} availableDrones={availableDrones} />
        </Suspense>
      </div>
    </div>
  );
}

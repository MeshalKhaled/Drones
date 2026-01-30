import { Suspense } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { mockMissions } from "@/services/mock-data";
import { getDroneState } from "@/app/actions/drones";
import { getDroneWithState, listDroneProfiles } from "@/lib/stores/drone-store";
import { DroneDetailsShell } from "@/components/drones/DroneDetailsShell";
import { DroneDetailsInitializer } from "@/components/drones/DroneDetailsInitializer";
import { TelemetryCard } from "@/components/drones/TelemetryCard";
import { MissionHistoryTable } from "@/components/drones/MissionHistoryTable";
import { CommandPanel } from "@/components/drones/CommandPanel";
import { AssetGallery } from "@/components/drones/AssetGallery";
import { DroneDetailsSkeleton, TelemetrySkeleton, MissionTableSkeleton } from "@/components/ui/skeletons";
import type { Drone, Mission } from "@/lib/domain/types";

// Dynamically import mini map (client-only, heavy)
const DroneMiniMap = dynamic(
  () => import("@/components/drones/DroneMiniMap").then((mod) => ({ default: mod.DroneMiniMap })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Live Position
        </h3>
        <div className="h-[240px] animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800 md:h-[320px]" />
      </div>
    ),
  }
);

interface DroneDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Generate static params for first 10 drones
export async function generateStaticParams() {
  const profiles = listDroneProfiles();
  return profiles.slice(0, 10).map((profile) => ({
    id: profile.id,
  }));
}

async function getDrone(id: string): Promise<Drone | null> {
  const droneWithState = getDroneWithState(id);
  if (!droneWithState) return null;

  return {
    id: droneWithState.profile.id,
    name: droneWithState.profile.name,
    status: droneWithState.runtime.status,
    batteryPct: droneWithState.runtime.batteryPct,
    flightHours: droneWithState.profile.flightHours,
    lastMission: droneWithState.profile.lastMission,
    updatedAt: droneWithState.runtime.updatedAt,
    position: droneWithState.runtime.position,
    health: droneWithState.profile.health,
  };
}

async function getMissionsForDrone(
  droneId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  missions: Mission[];
  total: number;
  totalPages: number;
}> {
  const filtered = mockMissions.filter((m) => m.droneId === droneId);
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const missions = filtered.slice(startIndex, endIndex);

  return { missions, total, totalPages };
}

async function MissionHistorySection({ droneId, page }: { droneId: string; page: number }) {
  const { missions, totalPages } = await getMissionsForDrone(droneId, page);

  return (
    <MissionHistoryTable
      missions={missions}
      droneId={droneId}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}

async function DroneDetailsContent({ id, page }: { id: string; page: number }) {
  const drone = await getDrone(id);

  if (!drone) {
    notFound();
  }

  // Get command state for display
  const commandState = await getDroneState(id);

  // Get Mapbox token for mini map
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  return (
    <DroneDetailsShell drone={drone} commandState={commandState}>
      {/* Initialize global selected drone */}
      <DroneDetailsInitializer droneId={drone.id} />

      {/* Mini Map */}
      {mapboxToken && <DroneMiniMap droneId={drone.id} mapboxToken={mapboxToken} />}

      {/* Live Telemetry */}
      <Suspense fallback={<TelemetrySkeleton />}>
        <TelemetryCard droneId={drone.id} />
      </Suspense>

      {/* Commands */}
      <CommandPanel droneId={drone.id} />

      {/* Mission History */}
      <Suspense fallback={<MissionTableSkeleton />}>
        <MissionHistorySection droneId={drone.id} page={page} />
      </Suspense>

      {/* Asset Gallery */}
      <AssetGallery droneId={drone.id} />
    </DroneDetailsShell>
  );
}

export default async function DroneDetailPage({ params, searchParams }: DroneDetailPageProps) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  return (
    <Suspense fallback={<DroneDetailsSkeleton />}>
      <DroneDetailsContent id={id} page={currentPage} />
    </Suspense>
  );
}

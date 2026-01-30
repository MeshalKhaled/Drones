import { Suspense } from "react";
import dynamic from "next/dynamic";
import MapLoading from "./loading";

// Dynamically import MapClient with no SSR
const MapClient = dynamic(
  () => import("@/components/map/MapClient").then((mod) => ({ default: mod.MapClient })),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

function getMapboxToken(): string | null {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || null;
}

interface MapPageProps {
  searchParams: Promise<{ droneId?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const mapboxToken = getMapboxToken();
  const params = await searchParams;
  const initialSelectedDroneId = params.droneId || null;

  return (
    <div
      className="absolute inset-0 -m-4 lg:-m-6"
      style={{ height: "calc(100vh - 64px)", width: "calc(100% + 2rem)" }}
    >
      <Suspense fallback={<MapLoading />}>
        <MapClient
          mapboxToken={mapboxToken || ""}
          initialSelectedDroneId={initialSelectedDroneId}
        />
      </Suspense>
    </div>
  );
}

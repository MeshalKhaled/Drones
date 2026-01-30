"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { MissionWaypoint } from "@/lib/domain/types";
import { useMissionUIStore } from "@/lib/stores/ui/missionUiStore";

interface MissionMapCanvasProps {
  mapboxToken: string;
  waypoints: MissionWaypoint[];
  onWaypointAdd: (lat: number, lng: number) => void;
  onWaypointSelect: (id: string) => void;
}

export function MissionMapCanvas({
  mapboxToken,
  waypoints,
  onWaypointAdd,
  onWaypointSelect,
}: MissionMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const pathSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { selectedWaypointId } = useMissionUIStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.4194, 37.7749],
      zoom: 12,
      antialias: true,
      // Mobile gesture support
      touchZoomRotate: true,
      touchPitch: true,
      dragRotate: true,
    });

    map.on("load", () => {
      setMapLoaded(true);

      // Add path source
      map.addSource("mission-path", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Add path layer
      map.addLayer({
        id: "mission-path",
        type: "line",
        source: "mission-path",
        paint: {
          "line-color": "#60a5fa",
          "line-width": 3,
          "line-opacity": 0.6,
          "line-dasharray": [2, 2],
        },
      });

      pathSourceRef.current = map.getSource("mission-path") as mapboxgl.GeoJSONSource;

      // Click handler to add waypoint
      map.on("click", (e) => {
        onWaypointAdd(e.lngLat.lat, e.lngLat.lng);
      });

      // Change cursor on hover
      map.getCanvas().style.cursor = "crosshair";
    });

    mapRef.current = map;

    // Capture markers ref value for cleanup
    const markersToCleanup = markersRef.current;

    return () => {
      markersToCleanup.forEach((marker) => marker.remove());
      markersToCleanup.clear();
      if (map) {
        map.remove();
      }
      mapRef.current = null;
    };
  }, [mapboxToken, onWaypointAdd]);

  // Update waypoints on map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !pathSourceRef.current) return;

    const map = mapRef.current;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    waypoints.forEach((wp) => {
      const el = document.createElement("div");
      el.className = "waypoint-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = selectedWaypointId === wp.id ? "#60a5fa" : "#4ade80";
      el.style.border = "3px solid #fff";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "12px";
      el.style.fontWeight = "bold";
      el.style.color = "#fff";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.textContent = String(wp.order + 1);

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([wp.lng, wp.lat]).addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onWaypointSelect(wp.id);
      });

      markersRef.current.set(wp.id, marker);
    });

    // Update path
    if (waypoints.length >= 2) {
      const coordinates = waypoints
        .sort((a, b) => a.order - b.order)
        .map((wp) => [wp.lng, wp.lat] as [number, number]);

      pathSourceRef.current.setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {},
      });
    } else {
      pathSourceRef.current.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [waypoints, mapLoaded, selectedWaypointId, onWaypointSelect]);

  // Focus on selected waypoint
  useEffect(() => {
    if (!mapRef.current || !selectedWaypointId) return;

    const waypoint = waypoints.find((wp) => wp.id === selectedWaypointId);
    if (waypoint) {
      mapRef.current.flyTo({
        center: [waypoint.lng, waypoint.lat],
        zoom: Math.max(mapRef.current.getZoom(), 15),
        duration: 500,
      });
    }
  }, [selectedWaypointId, waypoints]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0b]">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#60a5fa] border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div className="absolute left-4 top-4 rounded-md border border-[#1a1a1c] bg-[#0a0a0b] px-3 py-2 text-sm text-foreground">
        Click on the map to add waypoints
      </div>
    </div>
  );
}

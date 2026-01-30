"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import mapboxgl from "mapbox-gl";
import { useTelemetryPolling } from "@/hooks/data/useTelemetryPolling";
import { getFlightTrail } from "@/services/mock-data";
import { AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { surface, border, text, getMapStyle } from "@/lib/theme";

interface DroneMiniMapProps {
  droneId: string;
  mapboxToken: string;
}

export function DroneMiniMap({ droneId, mapboxToken }: DroneMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const trailSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const mapLoadedRef = useRef<boolean>(false);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const { telemetry } = useTelemetryPolling({
    scope: "drone",
    droneId,
    enabled: true,
    refetchInterval: typeof window !== "undefined" && document.hidden ? 6000 : 2000, // 2s active, 6s inactive
  });

  const latestTelemetry = useMemo(() => {
    if (!telemetry || telemetry.length === 0) return null;
    return telemetry[0];
  }, [telemetry]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !mapboxToken || !mounted) return;
    if (mapboxToken.trim() === "" || !mapboxToken.startsWith("pk.")) return;

    const container = mapContainerRef.current;

    // Wait for container to have dimensions
    const checkDimensions = () => {
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        requestAnimationFrame(checkDimensions);
        return;
      }

      try {
        mapboxgl.accessToken = mapboxToken;

        const initialCenter: [number, number] = latestTelemetry
          ? [latestTelemetry.position.lng, latestTelemetry.position.lat]
          : [-122.4194, 37.7749];

        const map = new mapboxgl.Map({
          container,
          style: getMapStyle(isDark),
          center: initialCenter,
          zoom: 14,
          interactive: true,
          attributionControl: false,
          // Mobile gesture support
          touchZoomRotate: true,
          touchPitch: true,
        });

        map.on("load", () => {
          mapLoadedRef.current = true;

          // Add trail source
          map.addSource("trail", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          // Add trail layer
          map.addLayer({
            id: "trail-line",
            type: "line",
            source: "trail",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#60a5fa",
              "line-width": 2,
              "line-opacity": 0.6,
            },
          });

          trailSourceRef.current = map.getSource("trail") as mapboxgl.GeoJSONSource;

          // Add marker (will be updated by telemetry effect)
          const el = document.createElement("div");
          el.className = "drone-marker";
          el.style.width = "12px";
          el.style.height = "12px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = "#60a5fa";
          el.style.border = isDark ? "2px solid white" : "2px solid #18181b";
          el.style.boxShadow = "0 0 8px rgba(96, 165, 250, 0.6)";

          markerRef.current = new mapboxgl.Marker(el).setLngLat(initialCenter).addTo(map);
        });

        mapRef.current = map;

        return () => {
          if (markerRef.current) {
            markerRef.current.remove();
          }
          if (map) {
            map.remove();
          }
          mapRef.current = null;
          mapLoadedRef.current = false;
        };
      } catch (error) {
        logger.error("Failed to initialize mini map:", error);
      }
    };

    checkDimensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken, droneId, mounted]); // Only initialize once

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current || !mounted) return;

    try {
      mapRef.current.setStyle(getMapStyle(isDark));

      // Re-add trail layer after style change
      mapRef.current.once("style.load", () => {
        if (!mapRef.current) return;

        mapRef.current.addSource("trail", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        mapRef.current.addLayer({
          id: "trail-line",
          type: "line",
          source: "trail",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#60a5fa",
            "line-width": 2,
            "line-opacity": 0.6,
          },
        });

        trailSourceRef.current = mapRef.current.getSource("trail") as mapboxgl.GeoJSONSource;

        // Update marker border color
        if (markerRef.current) {
          const el = markerRef.current.getElement();
          el.style.border = isDark ? "2px solid white" : "2px solid #18181b";
        }
      });
    } catch (error) {
      logger.debug("Mini map style update error:", error);
    }
  }, [isDark, mounted]);

  // Update marker and trail when telemetry changes
  useEffect(() => {
    if (!latestTelemetry || !mapRef.current || !mapLoadedRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;

    try {
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLngLat([latestTelemetry.position.lng, latestTelemetry.position.lat]);
      }

      // Update trail
      const trail = getFlightTrail(droneId);
      if (trailSourceRef.current && trail.length > 0) {
        const trailCoordinates = trail.map((p) => [p.lng, p.lat] as [number, number]);

        // Add current position to trail
        trailCoordinates.push([latestTelemetry.position.lng, latestTelemetry.position.lat]);

        trailSourceRef.current.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: trailCoordinates,
              },
              properties: {},
            },
          ],
        });

        // Fit bounds to trail + current position
        if (trailCoordinates.length > 1) {
          const lngs = trailCoordinates.map((c) => c[0]);
          const lats = trailCoordinates.map((c) => c[1]);
          const bounds = [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ] as [[number, number], [number, number]];

          mapRef.current.fitBounds(bounds, {
            padding: 20,
            duration: 500,
          });
        } else {
          // Just center on current position
          mapRef.current.flyTo({
            center: [latestTelemetry.position.lng, latestTelemetry.position.lat],
            zoom: 14,
            duration: 500,
          });
        }
      }
    } catch (error) {
      logger.debug("Mini map update error:", error);
    }
  }, [latestTelemetry, droneId]);

  const hasValidToken =
    mapboxToken && mapboxToken.trim().length > 0 && mapboxToken.startsWith("pk.");

  if (!hasValidToken) {
    return (
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h3 className={cn("mb-2 text-sm font-semibold", text.primary)}>Mini Map</h3>
        <div
          className={cn(
            "flex h-[240px] items-center justify-center rounded-md border md:h-[320px]",
            surface.subtle,
            border.default
          )}
        >
          <div className="space-y-2 p-4 text-center">
            <AlertCircle className={cn("mx-auto h-6 w-6", text.muted)} />
            <p className={cn("text-xs", text.muted)}>Mapbox token required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border p-6", surface.base, border.default)}>
      <h3 className={cn("mb-3 text-sm font-semibold", text.primary)}>Live Position</h3>
      <div
        ref={mapContainerRef}
        className={cn(
          "h-[240px] w-full overflow-hidden rounded-md border md:h-[320px]",
          border.default
        )}
        style={{ minHeight: "240px" }}
      />
      {latestTelemetry && (
        <div className={cn("mt-3 text-xs", text.muted)}>
          <p>
            {latestTelemetry.position.lat.toFixed(6)}, {latestTelemetry.position.lng.toFixed(6)}
          </p>
          <p>Altitude: {latestTelemetry.altitude.toFixed(1)}m</p>
        </div>
      )}
    </div>
  );
}

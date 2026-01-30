"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
// Mapbox CSS is imported globally in app/globals.css
import type { Telemetry, Mission } from "@/lib/domain/types";
import { useMapUIStore } from "@/lib/stores/ui/mapUiStore";
import { useGlobalUIStore } from "@/lib/stores/ui/globalUiStore";
import { logger } from "@/lib/logger";
import { getMapStyle } from "@/lib/utils/theme";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import { useInterpolatedDrones } from "./perf/useInterpolatedDrones";

interface MapCanvasProps {
  telemetry: Telemetry[];
  mapboxToken: string;
  activeMission: Mission | null;
}

const statusColors: Record<string, string> = {
  online: "#4ade80",
  "in-mission": "#60a5fa",
  charging: "#fbbf24",
  offline: "#f87171",
};

// Flight trails tracking (last 30 points per drone, max 5 minutes old)
const flightTrails = new Map<string, Array<{ lat: number; lng: number; timestamp: number }>>();

// Flight trail configuration
const TRAIL_MAX_POINTS = 30;
const TRAIL_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const TRAIL_CLEANUP_INTERVAL_MS = 30 * 1000; // Cleanup every 30 seconds

// Cleanup old trail points and remove inactive drones
function cleanupFlightTrails(activeDroneIds: Set<string>): void {
  const now = Date.now();
  const cutoffTime = now - TRAIL_MAX_AGE_MS;

  // Remove trails for drones not in current telemetry
  const keysToDelete: string[] = [];
  flightTrails.forEach((_, droneId) => {
    if (!activeDroneIds.has(droneId)) {
      keysToDelete.push(droneId);
    }
  });
  keysToDelete.forEach((key) => flightTrails.delete(key));

  // Prune old points from remaining trails
  flightTrails.forEach((trail, droneId) => {
    const prunedTrail = trail.filter((point) => point.timestamp > cutoffTime);
    if (prunedTrail.length === 0) {
      flightTrails.delete(droneId);
    } else if (prunedTrail.length !== trail.length) {
      flightTrails.set(droneId, prunedTrail);
    }
  });
}

export function MapCanvas({ telemetry, mapboxToken, activeMission }: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const dronesSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const trailsSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const missionPathsSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const missionWaypointsSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hoveredDroneIdRef = useRef<string | null>(null);
  const mapLoadedRef = useRef<boolean>(false);
  const updateThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const latestTelemetryRef = useRef<Telemetry[]>([]);
  const activeMissionRef = useRef<Mission | null>(null);

  const { selectedDroneId, openDronePanel, layers, followMode, closeDronePanel } = useMapUIStore();
  const setGlobalSelectedDroneId = useGlobalUIStore((state) => state.setSelectedDroneId);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Determine initial theme (avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Enable interpolation when no drone is selected (reduces update frequency)
  const interpolationEnabled = !selectedDroneId && mapLoadedRef.current;

  // Use interpolation for smooth marker movement (only when no selection)
  useInterpolatedDrones(
    mapRef.current,
    dronesSourceRef.current,
    telemetry,
    interpolationEnabled && mapLoadedRef.current
  );

  // Keep activeMission ref updated
  useEffect(() => {
    activeMissionRef.current = activeMission;
  }, [activeMission]);

  // Handle zoom and center events
  useEffect(() => {
    const handleZoom = (e: CustomEvent<{ direction: "in" | "out" }>) => {
      if (!mapRef.current || !mapLoadedRef.current) return;
      if (!mapRef.current.isStyleLoaded()) return;
      try {
        const zoom = mapRef.current.getZoom();
        mapRef.current.zoomTo(zoom + (e.detail.direction === "in" ? 1 : -1), {
          duration: 300,
        });
      } catch (error) {
        logger.debug("Zoom error:", error);
      }
    };

    const handleCenter = (e: CustomEvent<{ lat: number; lng: number }>) => {
      if (!mapRef.current || !mapLoadedRef.current) return;
      if (!mapRef.current.isStyleLoaded()) return;
      try {
        mapRef.current.flyTo({
          center: [e.detail.lng, e.detail.lat],
          zoom: 13,
          duration: 1000,
        });
      } catch (error) {
        logger.debug("Center error:", error);
      }
    };

    const handleFitBounds = (e: CustomEvent<{ bounds: [[number, number], [number, number]] }>) => {
      if (!mapRef.current || !mapLoadedRef.current) return;
      if (!mapRef.current.isStyleLoaded()) return;
      try {
        mapRef.current.fitBounds(e.detail.bounds, {
          padding: 50,
          duration: 1000,
        });
      } catch (error) {
        logger.debug("FitBounds error:", error);
      }
    };

    window.addEventListener("map-zoom", handleZoom as EventListener);
    window.addEventListener("map-center", handleCenter as EventListener);
    window.addEventListener("map-fit-bounds", handleFitBounds as EventListener);

    return () => {
      window.removeEventListener("map-zoom", handleZoom as EventListener);
      window.removeEventListener("map-center", handleCenter as EventListener);
      window.removeEventListener("map-fit-bounds", handleFitBounds as EventListener);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!mapboxToken || mapboxToken.trim() === "") {
      return;
    }

    const container = mapContainerRef.current;

    // Wait for container to have dimensions
    const checkDimensions = () => {
      const rect = container.getBoundingClientRect();
      const containerHeight = rect.height || container.offsetHeight || container.clientHeight;
      const containerWidth = rect.width || container.offsetWidth || container.clientWidth;

      if (containerHeight === 0 || containerWidth === 0) {
        logger.warn("Map container has zero dimensions, retrying...");
        requestAnimationFrame(checkDimensions);
        return;
      }

      try {
        mapboxgl.accessToken = mapboxToken;

        // Use theme-aware map style from initialization
        const initialIsDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const map = new mapboxgl.Map({
          container: container,
          style: getMapStyle(initialIsDark),
          center: [-122.4194, 37.7749],
          zoom: 12,
          antialias: true,
          // Mobile gesture support
          touchZoomRotate: true,
          touchPitch: true,
          dragRotate: true,
          // Cooperative gestures for better mobile UX
          cooperativeGestures: false, // Disable to allow immediate interaction
        });

        // Error handling
        map.on("error", (e) => {
          logger.error("Mapbox error:", e.error?.message || e);
        });

        map.on("load", () => {
          // Call resize once after load to ensure proper sizing
          setTimeout(() => {
            if (map.isStyleLoaded()) {
              map.resize();
            }
          }, 100);

          // Add drones GeoJSON source
          map.addSource("drones", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          // Add trails GeoJSON source
          map.addSource("trails", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          // Add mission paths GeoJSON source
          map.addSource("mission-paths", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          // Add mission waypoints GeoJSON source
          map.addSource("mission-waypoints", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          // Add drones circle layer
          map.addLayer({
            id: "drones",
            type: "circle",
            source: "drones",
            paint: {
              "circle-radius": 8,
              "circle-color": [
                "match",
                ["get", "status"],
                "online",
                statusColors.online,
                "in-mission",
                statusColors["in-mission"],
                "charging",
                statusColors.charging,
                "offline",
                statusColors.offline,
                "#666",
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#000",
              "circle-stroke-opacity": 0.8,
            },
          });

          // Add trails line layer (below mission paths)
          map.addLayer({
            id: "trails",
            type: "line",
            source: "trails",
            paint: {
              "line-color": "#60a5fa",
              "line-width": 2,
              "line-opacity": 0.4,
            },
          });

          // Add mission paths line layer (above trails)
          map.addLayer({
            id: "mission-paths",
            type: "line",
            source: "mission-paths",
            paint: {
              "line-color": "#fbbf24",
              "line-width": 3,
              "line-opacity": 0.8,
              "line-dasharray": [2, 2],
            },
          });

          // Add mission waypoints circle layer
          map.addLayer({
            id: "mission-waypoints",
            type: "circle",
            source: "mission-waypoints",
            paint: {
              "circle-radius": 8,
              "circle-color": "#fbbf24",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
              "circle-stroke-opacity": 0.9,
            },
          });

          // Add mission waypoint labels layer
          map.addLayer({
            id: "mission-waypoint-labels",
            type: "symbol",
            source: "mission-waypoints",
            layout: {
              "text-field": ["to-string", ["+", ["get", "waypointOrder"], 1]],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-size": 12,
              "text-offset": [0, 0],
              "text-anchor": "center",
            },
            paint: {
              "text-color": "#000",
              "text-halo-color": "#fff",
              "text-halo-width": 2,
            },
          });

          dronesSourceRef.current = map.getSource("drones") as mapboxgl.GeoJSONSource;
          trailsSourceRef.current = map.getSource("trails") as mapboxgl.GeoJSONSource;
          missionPathsSourceRef.current = map.getSource("mission-paths") as mapboxgl.GeoJSONSource;
          missionWaypointsSourceRef.current = map.getSource(
            "mission-waypoints"
          ) as mapboxgl.GeoJSONSource;
          mapLoadedRef.current = true;

          // Add NavigationControl
          const nav = new mapboxgl.NavigationControl();
          map.addControl(nav, "top-right");

          // Track if a drone was clicked to prevent generic click handler from clearing selection
          let droneClickHandled = false;

          // Click handler for drones
          map.on("click", "drones", (e) => {
            if (e.features && e.features[0]) {
              droneClickHandled = true;
              const droneId = e.features[0].properties?.droneId as string;
              if (droneId) {
                logger.debug("Drone clicked:", droneId);
                setGlobalSelectedDroneId(droneId);
                openDronePanel(droneId);
                // Mission will be fetched automatically via React Query when selectedDroneId changes
              }
              // Reset flag after a short delay
              setTimeout(() => {
                droneClickHandled = false;
              }, 100);
            }
          });

          // Click handler for empty map area (clear selection)
          map.on("click", (e) => {
            // Skip if drone click was just handled
            if (droneClickHandled) {
              return;
            }

            // Query for features at click point to check if we clicked on a drone or waypoint
            const features = map.queryRenderedFeatures(e.point, {
              layers: ["drones", "mission-waypoints"],
            });

            // Only clear if not clicking on a drone or waypoint
            if (features.length === 0) {
              logger.debug("Map background clicked, clearing selection");
              setGlobalSelectedDroneId(null);
              closeDronePanel();
              activeMissionRef.current = null;
            }
          });

          // Hover handler for tooltip
          map.on("mousemove", "drones", (e) => {
            if (e.features && e.features[0] && tooltipRef.current) {
              const props = e.features[0].properties;
              const droneId = props?.droneId as string;
              hoveredDroneIdRef.current = droneId;

              if (tooltipRef.current) {
                tooltipRef.current.style.display = "block";
                tooltipRef.current.innerHTML = `
                <div class="font-semibold text-foreground">${props?.name || "Drone"}</div>
                <div class="text-xs text-muted-foreground">Battery: ${props?.batteryPct || 0}%</div>
                <div class="text-xs text-muted-foreground">Status: ${props?.status || "unknown"}</div>
              `;
              }
            }
          });

          map.on("mouseleave", "drones", () => {
            hoveredDroneIdRef.current = null;
            if (tooltipRef.current) {
              tooltipRef.current.style.display = "none";
            }
          });

          // Update tooltip position on mouse move
          map.on("mousemove", (e) => {
            if (tooltipRef.current && hoveredDroneIdRef.current) {
              tooltipRef.current.style.left = `${e.point.x}px`;
              tooltipRef.current.style.top = `${e.point.y - 10}px`;
            }
          });
        });

        mapRef.current = map;

        // Resize handler
        const handleResize = () => {
          if (map && map.isStyleLoaded()) {
            map.resize();
          }
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          if (updateThrottleRef.current) {
            clearInterval(updateThrottleRef.current);
          }
          if (map) {
            map.remove();
          }
          mapRef.current = null;
          mapLoadedRef.current = false;
        };
      } catch (error) {
        logger.error("Failed to initialize map:", error);
      }
    };

    // Start checking dimensions
    checkDimensions();
  }, [mapboxToken, openDronePanel, setGlobalSelectedDroneId, closeDronePanel]);

  // Track last cleanup time
  const lastCleanupRef = useRef<number>(Date.now());

  // Update flight trails from telemetry with proper cleanup
  const updateTrails = useCallback((t: Telemetry[]) => {
    const now = Date.now();

    // Periodic cleanup of stale trails
    if (now - lastCleanupRef.current > TRAIL_CLEANUP_INTERVAL_MS) {
      const activeDroneIds = new Set(t.map((tel) => tel.droneId));
      cleanupFlightTrails(activeDroneIds);
      lastCleanupRef.current = now;
    }

    t.forEach((telemetry) => {
      if (telemetry.position.alt > 0) {
        const trail = flightTrails.get(telemetry.droneId) || [];
        trail.push({
          lat: telemetry.position.lat,
          lng: telemetry.position.lng,
          timestamp: now,
        });
        // Keep last N points
        if (trail.length > TRAIL_MAX_POINTS) {
          trail.shift();
        }
        flightTrails.set(telemetry.droneId, trail);
      }
    });
  }, []);

  // Update map data (throttled to 250ms)
  const updateMapData = useCallback(() => {
    if (!mapRef.current || !mapLoadedRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;
    if (!dronesSourceRef.current || !trailsSourceRef.current) return;

    const t = latestTelemetryRef.current;
    const mission = activeMissionRef.current;

    // Update trails
    if (t.length > 0) {
      updateTrails(t);
    }

    // Infer status from telemetry
    const droneStatusMap = new Map<string, string>();
    const droneNameMap = new Map<string, string>();

    if (t.length > 0) {
      t.forEach((telemetry) => {
        let status = "online";
        if (telemetry.position.alt === 0 && telemetry.speed === 0) {
          status = telemetry.batteryPct < 20 ? "offline" : "charging";
        } else if (telemetry.speed > 15) {
          status = "in-mission";
        }
        droneStatusMap.set(telemetry.droneId, status);
        const shortId = telemetry.droneId.slice(0, 8);
        droneNameMap.set(telemetry.droneId, `Drone ${shortId}`);
      });

      // Only update drones source directly if interpolation is disabled (drone selected)
      // When interpolation is enabled, useInterpolatedDrones handles updates
      if (!interpolationEnabled) {
        // Create GeoJSON for drones
        const droneFeatures = t.map((telemetry) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [telemetry.position.lng, telemetry.position.lat],
          },
          properties: {
            droneId: telemetry.droneId,
            name: droneNameMap.get(telemetry.droneId) || `Drone ${telemetry.droneId.slice(0, 8)}`,
            status: droneStatusMap.get(telemetry.droneId) || "online",
            batteryPct: Math.round(telemetry.batteryPct),
          },
        }));

        // Update drones source
        if (layers.markers && dronesSourceRef.current) {
          dronesSourceRef.current.setData({
            type: "FeatureCollection",
            features: droneFeatures,
          });
        }
      }
    }

    // Create GeoJSON for trails
    const trailFeatures: Array<{
      type: "Feature";
      geometry: { type: "LineString"; coordinates: number[][] };
      properties: { droneId: string };
    }> = [];

    flightTrails.forEach((trail, droneId) => {
      if (trail.length >= 2) {
        trailFeatures.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: trail.map((p) => [p.lng, p.lat]),
          },
          properties: { droneId },
        });
      }
    });

    // Update trails source
    if (layers.trails && trailsSourceRef.current) {
      trailsSourceRef.current.setData({
        type: "FeatureCollection",
        features: trailFeatures,
      });
    }

    // Create GeoJSON for mission paths and waypoints (only for selected drone)
    const missionPathFeatures: Array<{
      type: "Feature";
      geometry: { type: "LineString"; coordinates: number[][] };
      properties: { missionId: string; droneId: string };
    }> = [];

    const missionWaypointFeatures: Array<{
      type: "Feature";
      geometry: { type: "Point"; coordinates: number[] };
      properties: { missionId: string; waypointIndex: number; waypointOrder: number };
    }> = [];

    // Only render mission if there's a selected drone with an active mission
    if (mission && mission.waypoints.length >= 2) {
      // Mission path (all waypoints)
      const coordinates = mission.waypoints
        .sort((a, b) => a.order - b.order)
        .map((wp) => [wp.lng, wp.lat] as [number, number]);

      missionPathFeatures.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {
          missionId: mission.id,
          droneId: mission.droneId,
        },
      });

      // Mission waypoints (all waypoints as markers with order numbers)
      mission.waypoints
        .sort((a, b) => a.order - b.order)
        .forEach((wp, index) => {
          missionWaypointFeatures.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [wp.lng, wp.lat],
            },
            properties: {
              missionId: mission.id,
              waypointIndex: index,
              waypointOrder: wp.order,
            },
          });
        });
    }

    // Update mission paths source
    if (missionPathsSourceRef.current) {
      missionPathsSourceRef.current.setData({
        type: "FeatureCollection",
        features: missionPathFeatures,
      });
    }

    // Update mission waypoints source
    if (missionWaypointsSourceRef.current) {
      missionWaypointsSourceRef.current.setData({
        type: "FeatureCollection",
        features: missionWaypointFeatures,
      });
    }
  }, [layers, updateTrails, interpolationEnabled]);

  // Store latest telemetry, throttle updates
  useEffect(() => {
    latestTelemetryRef.current = telemetry;

    // Skip direct updates when interpolation is enabled (interpolation handles it)
    if (interpolationEnabled) {
      return;
    }

    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
    }

    updateThrottleRef.current = setTimeout(() => {
      updateMapData();
    }, 250);

    return () => {
      if (updateThrottleRef.current) {
        clearTimeout(updateThrottleRef.current);
      }
    };
  }, [telemetry, updateMapData, interpolationEnabled]);

  // Update map when activeMission changes
  useEffect(() => {
    // Trigger map update when mission data changes
    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
    }
    updateThrottleRef.current = setTimeout(() => {
      updateMapData();
    }, 100);
  }, [activeMission, selectedDroneId, updateMapData]);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current || !mounted) return;
    if (!mapRef.current.isStyleLoaded()) return;

    try {
      mapRef.current.setStyle(getMapStyle(isDark));
    } catch (error) {
      logger.debug("Map style update error:", error);
    }
  }, [isDark, mounted]);

  // Follow selected drone
  useEffect(() => {
    if (!followMode || !selectedDroneId || !mapRef.current || !mapLoadedRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;

    const selectedTelemetry = latestTelemetryRef.current.find((t) => t.droneId === selectedDroneId);
    if (selectedTelemetry && mapRef.current) {
      try {
        mapRef.current.easeTo({
          center: [selectedTelemetry.position.lng, selectedTelemetry.position.lat],
          zoom: 15,
          duration: 1000,
        });
      } catch (error) {
        logger.debug("Follow error:", error);
      }
    }
  }, [selectedDroneId, followMode]);

  // Toggle layer visibility
  useEffect(() => {
    if (!mapRef.current || !mapLoadedRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;

    try {
      const dronesLayer = mapRef.current.getLayer("drones");
      const trailsLayer = mapRef.current.getLayer("trails");

      if (dronesLayer) {
        const visibility = layers.markers ? "visible" : "none";
        mapRef.current.setLayoutProperty("drones", "visibility", visibility);
      }

      if (trailsLayer) {
        const trailsVisibility = layers.trails ? "visible" : "none";
        mapRef.current.setLayoutProperty("trails", "visibility", trailsVisibility);
      }
    } catch (error) {
      logger.debug("Layer toggle error:", error);
    }
  }, [layers]);

  const handleClearSelection = () => {
    setGlobalSelectedDroneId(null);
    closeDronePanel();
    activeMissionRef.current = null;
    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
    }
    updateThrottleRef.current = setTimeout(() => {
      updateMapData();
    }, 100);
  };

  return (
    <div className="absolute inset-0 h-full w-full">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
        style={{ minHeight: "400px" }}
      />
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-50 hidden rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground shadow-lg"
        style={{ transform: "translate(-50%, -100%)" }}
      />
      {/* Mission overlay panel */}
      {activeMission && selectedDroneId && (
        <div className="absolute left-4 top-4 z-40 max-w-xs rounded-lg border border-border bg-card p-4 shadow-lg">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Active Mission</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Mission {activeMission.id.slice(0, 8)} • {activeMission.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeMission.waypoints.length} waypoints • WP{" "}
                {(activeMission.currentWaypointIndex ?? 0) + 1}
              </p>
            </div>
            <button
              onClick={handleClearSelection}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

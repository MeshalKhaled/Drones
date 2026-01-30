"use client";

import { useRef, useEffect } from "react";
import type { Telemetry } from "@/lib/domain/types";
import type { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";

interface InterpolatedPosition {
  lat: number;
  lng: number;
  alt: number;
  speed: number;
  timestamp: number;
}

interface DroneInterpolationState {
  lastPos: InterpolatedPosition | null;
  nextPos: InterpolatedPosition | null;
}

/**
 * Hook for interpolating drone positions between telemetry updates
 * Updates Mapbox source directly without React re-renders
 */
export function useInterpolatedDrones(
  map: MapboxMap | null,
  dronesSource: GeoJSONSource | null,
  telemetry: Telemetry[],
  enabled: boolean
): void {
  const interpolationStateRef = useRef<Map<string, DroneInterpolationState>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_RATE_MS = 50; // ~20 fps max

  // Update interpolation state when new telemetry arrives
  useEffect(() => {
    if (!enabled || !map || !dronesSource) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_RATE_MS) return;
    lastUpdateRef.current = now;

    telemetry.forEach((t) => {
      const state = interpolationStateRef.current.get(t.droneId) || {
        lastPos: null,
        nextPos: null,
      };

      // Shift next -> last, set new next from server
      if (state.nextPos) {
        state.lastPos = state.nextPos;
      }

      state.nextPos = {
        lat: t.position.lat,
        lng: t.position.lng,
        alt: t.position.alt,
        speed: t.speed,
        timestamp: Date.now(),
      };

      // Initialize lastPos if not set
      if (!state.lastPos) {
        state.lastPos = { ...state.nextPos };
      }

      interpolationStateRef.current.set(t.droneId, state);
    });

    // Remove drones that are no longer in telemetry
    const activeDroneIds = new Set(telemetry.map((t) => t.droneId));
    interpolationStateRef.current.forEach((_, droneId) => {
      if (!activeDroneIds.has(droneId)) {
        interpolationStateRef.current.delete(droneId);
      }
    });
  }, [telemetry, map, dronesSource, enabled]);

  // Animation loop for interpolation
  useEffect(() => {
    if (!enabled || !map || !dronesSource) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime < UPDATE_RATE_MS) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;

      if (!map.isStyleLoaded() || !dronesSource) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = Date.now();
      const features: Array<{
        type: "Feature";
        geometry: { type: "Point"; coordinates: number[] };
        properties: Record<string, unknown>;
      }> = [];

      interpolationStateRef.current.forEach((state, droneId) => {
        if (!state.lastPos || !state.nextPos) return;

        const timeSinceLast = now - state.lastPos.timestamp;
        const timeBetween = state.nextPos.timestamp - state.lastPos.timestamp;

        // If next update hasn't arrived yet, interpolate
        let interpolatedLat: number;
        let interpolatedLng: number;
        let interpolatedAlt: number;

        if (timeBetween > 0 && timeSinceLast < timeBetween) {
          // Interpolate between last and next
          const t = Math.min(timeSinceLast / timeBetween, 1);
          interpolatedLat = state.lastPos.lat + (state.nextPos.lat - state.lastPos.lat) * t;
          interpolatedLng = state.lastPos.lng + (state.nextPos.lng - state.lastPos.lng) * t;
          interpolatedAlt = state.lastPos.alt + (state.nextPos.alt - state.lastPos.alt) * t;
        } else {
          // Use next position (server data is current)
          interpolatedLat = state.nextPos.lat;
          interpolatedLng = state.nextPos.lng;
          interpolatedAlt = state.nextPos.alt;
        }

        // Find original telemetry for status/battery
        const originalTelemetry = telemetry.find((t) => t.droneId === droneId);
        if (!originalTelemetry) return;

        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [interpolatedLng, interpolatedLat],
          },
          properties: {
            droneId,
            name: `Drone ${droneId.slice(0, 8)}`,
            status: originalTelemetry.position.alt === 0 && originalTelemetry.speed === 0
              ? originalTelemetry.batteryPct < 20 ? "offline" : "charging"
              : originalTelemetry.speed > 15 ? "in-mission" : "online",
            batteryPct: Math.round(originalTelemetry.batteryPct),
            altitude: interpolatedAlt,
          },
        });
      });

      // Batch update Mapbox source (no React re-render)
      try {
        dronesSource.setData({
          type: "FeatureCollection",
          features,
        });
      } catch {
        // Source may not be ready, ignore
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, map, dronesSource, telemetry]);
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  X,
  Battery,
  Gauge,
  Signal,
  ExternalLink,
  MapPin,
  Zap,
  Navigation,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { useMapUIStore } from "@/lib/stores/ui/mapUiStore";
import { useActiveMission } from "@/hooks/data/useActiveMission";
import { useDrone } from "@/hooks/data/useDrone";
import { cancelMissionAction } from "@/app/actions/missions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import type { MissionEvent, Telemetry } from "@/lib/domain/types";
import { formatBattery, formatTimeAgo, cn } from "@/lib/utils";
import { getMissionReason, getMissionReasonLabel } from "@/lib/utils/mission-reasons";
import { motion, AnimatePresence } from "framer-motion";

interface TelemetryPanelProps {
  telemetry: Telemetry[];
}

export function TelemetryPanel({ telemetry }: TelemetryPanelProps) {
  const { selectedDroneId, panelOpen, closeDronePanel, followMode, setFollowMode } =
    useMapUIStore();
  const queryClient = useQueryClient();
  const [cancellingMissionId, setCancellingMissionId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Filter telemetry for selected drone (client-side)
  const selectedTelemetry = selectedDroneId
    ? telemetry.find((t: Telemetry) => t.droneId === selectedDroneId)
    : null;
  
  // Telemetry loading/error states are handled by MapClient
  const isLoading = false;
  const isError = false;

  // Fetch drone data and active mission using React Query for real-time updates
  const { data: selectedDrone } = useDrone(selectedDroneId);
  const { data: activeMission } = useActiveMission(selectedDroneId);

  const handleCancelMission = useCallback(async () => {
    if (!activeMission) return;
    setCancellingMissionId(activeMission.id);
    try {
      const result = await cancelMissionAction(activeMission.id);
      if (result.success) {
        toast.success("Mission cancelled successfully");
        queryClient.invalidateQueries({ queryKey: ["missions"] });
        queryClient.invalidateQueries({ queryKey: ["drones"] });
        queryClient.invalidateQueries({ queryKey: ["telemetry"] });
      } else {
        toast.error(result.error?.message || "Failed to cancel mission");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel mission");
    } finally {
      setCancellingMissionId(null);
      setConfirmCancel(false);
    }
  }, [activeMission, queryClient]);

  // selectedTelemetry is now computed above from map telemetry cache

  // Handle ESC key to close panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelOpen) {
        closeDronePanel();
      }
    },
    [panelOpen, closeDronePanel]
  );

  // Focus trap
  useEffect(() => {
    if (!panelOpen) {
      // Restore focus when closing
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    // Store currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus close button when panel opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    // Add keyboard listener
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [panelOpen, handleKeyDown]);

  // Focus trap handler
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  // Get status display info
  const getStatusInfo = () => {
    if (!selectedDrone) return { label: "Unknown", color: "text-zinc-500" };
    switch (selectedDrone.status) {
      case "online":
        return { label: "Online", color: "text-green-500", bg: "bg-green-500" };
      case "in-mission":
        return { label: "In Mission", color: "text-blue-500", bg: "bg-blue-500" };
      case "charging":
        return { label: "Charging", color: "text-yellow-500", bg: "bg-yellow-500" };
      case "offline":
        return { label: "Offline", color: "text-red-500", bg: "bg-red-500" };
      default:
        return { label: "Unknown", color: "text-zinc-500", bg: "bg-zinc-500" };
    }
  };

  const statusInfo = getStatusInfo();

  // Don't render anything if no drone selected and panel closed
  const shouldShow = panelOpen && selectedDroneId;

  // Sort waypoints by order
  const sortedWaypoints = activeMission?.waypoints
    ? [...activeMission.waypoints].sort((a, b) => a.order - b.order)
    : [];

  const currentWaypointIndex = activeMission?.currentWaypointIndex ?? 0;

  return (
    <>
      <AnimatePresence>
        {shouldShow && (
          <>
            {/* Mobile overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={closeDronePanel}
              aria-hidden="true"
            />

            {/* Panel - bottom sheet on mobile, sidebar on desktop */}
            <motion.div
              key="panel"
            ref={panelRef}
            initial={{ x: "100%", y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: "100%", y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed z-50 overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900",
              // Mobile: bottom sheet
              "inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl",
              // Desktop: right sidebar
              "lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-96 lg:rounded-none lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800"
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="telemetry-panel-title"
            onKeyDown={handleTabKey}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center py-2 lg:hidden">
              <div className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            <div className="space-y-6 p-6 pb-[env(safe-area-inset-bottom,1.5rem)]">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    id="telemetry-panel-title"
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {selectedDrone?.name || "Drone Telemetry"}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", statusInfo.bg)} />
                    <span className={cn("text-sm font-medium", statusInfo.color)}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={closeDronePanel}
                  className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  aria-label="Close telemetry panel"
                >
                  <X size={20} />
                </button>
              </div>

              {isLoading && (
                <div className="space-y-4" aria-label="Loading telemetry data">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              )}

              {isError && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                  role="alert"
                >
                  Failed to load telemetry data.
                </div>
              )}

              {selectedTelemetry && (
                <div className="space-y-6">
                  {/* View Details Link - CTA */}
                  <Link
                    href={`/drones/${selectedDroneId}`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
                  >
                    <ExternalLink size={18} />
                    Open full details
                  </Link>

                  {/* Active Mission with Waypoints */}
                  {activeMission && (
                    <div className="overflow-hidden rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                      {/* Mission Header */}
                      <div className="border-b border-blue-200 p-4 dark:border-blue-800">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Zap size={16} className="text-blue-500" />
                            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                              {activeMission.status === "in-progress" ? "Active Mission" : activeMission.status === "failed" ? "Failed Mission" : activeMission.status === "cancelled" ? "Cancelled Mission" : "Mission"}
                            </h3>
                          </div>
                          {activeMission.status === "in-progress" && (
                            <button
                              onClick={() => setConfirmCancel(true)}
                              disabled={cancellingMissionId === activeMission.id}
                              className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Cancel mission"
                            >
                              {cancellingMissionId === activeMission.id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
                        </div>
                        {(() => {
                          const reason = getMissionReason(activeMission);
                          return (activeMission.status === "failed" || activeMission.status === "cancelled") && reason ? (
                            <div className="mb-2 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              {getMissionReasonLabel(reason)}
                            </div>
                          ) : null;
                        })()}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">Mission:</span>
                            <span className="ml-1 font-mono text-zinc-900 dark:text-zinc-100">
                              {activeMission.id.slice(0, 8)}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">Progress:</span>
                            <span className="ml-1 font-semibold text-zinc-900 dark:text-zinc-100">
                              {currentWaypointIndex + 1}/{sortedWaypoints.length}
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{
                              width: `${((currentWaypointIndex + 1) / sortedWaypoints.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Waypoints List */}
                      <div className="p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Navigation size={14} className="text-blue-500" />
                          <h4 className="text-xs font-medium uppercase tracking-wider text-blue-700 dark:text-blue-400">
                            Flight Path
                          </h4>
                        </div>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {sortedWaypoints.map((waypoint, index) => {
                            const isCompleted = index < currentWaypointIndex;
                            const isCurrent = index === currentWaypointIndex;

                            return (
                              <div
                                key={`${waypoint.lat}-${waypoint.lng}-${index}`}
                                className={cn(
                                  "flex items-center gap-3 rounded-md p-2 transition-colors",
                                  isCurrent &&
                                    "bg-blue-100 ring-1 ring-blue-300 dark:bg-blue-800/50 dark:ring-blue-600",
                                  isCompleted && "opacity-60"
                                )}
                              >
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle2 size={18} className="text-green-500" />
                                  ) : isCurrent ? (
                                    <div className="relative">
                                      <Circle size={18} className="text-blue-500" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                      </div>
                                    </div>
                                  ) : (
                                    <Circle
                                      size={18}
                                      className="text-zinc-300 dark:text-zinc-600"
                                    />
                                  )}
                                </div>

                                {/* Waypoint Info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "text-sm font-medium",
                                        isCurrent
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-zinc-700 dark:text-zinc-300"
                                      )}
                                    >
                                      Waypoint {index + 1}
                                    </span>
                                    {isCurrent && (
                                      <span className="rounded bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                                    {waypoint.lat.toFixed(5)}, {waypoint.lng.toFixed(5)} •{" "}
                                    {waypoint.alt}m
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mission Events */}
                      {activeMission && (() => {
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const { getMissionEvents } = require("@/lib/stores/mission-execution-store");
                        const events = getMissionEvents(activeMission.id, 5);
                        return events.length > 0 ? (
                          <div className="border-t border-blue-200 p-4 dark:border-blue-800">
                            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-700 dark:text-blue-400">
                              Recent Events
                            </h4>
                            <div className="space-y-1.5">
                              {events.map((event: MissionEvent, idx: number) => (
                                <div
                                  key={`${event.timestamp}-${idx}-${event.type}`}
                                  className="text-xs text-zinc-600 dark:text-zinc-400"
                                >
                                  <span className="font-mono text-[10px]">
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                  </span>
                                  {" • "}
                                  <span>{event.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* No Mission Info */}
                  {!activeMission && (
                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">No active mission</p>
                      <Link
                        href="/missions/new"
                        className="mt-2 inline-block text-sm font-medium text-blue-500 hover:text-blue-600"
                      >
                        Create a mission
                      </Link>
                    </div>
                  )}

                  {/* Position */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      <MapPin size={14} />
                      Position
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Latitude:</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {selectedTelemetry.position.lat.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Longitude:</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {selectedTelemetry.position.lng.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Altitude:</span>
                        <span className="text-zinc-900 dark:text-zinc-100">
                          {selectedTelemetry.altitude.toFixed(1)} m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Battery */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      <Battery size={14} />
                      Battery
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatBattery(selectedTelemetry.batteryPct)}
                        </span>
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-xs font-medium",
                            selectedTelemetry.batteryPct >= 70
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : selectedTelemetry.batteryPct >= 30
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          {selectedTelemetry.batteryPct >= 70
                            ? "Good"
                            : selectedTelemetry.batteryPct >= 30
                              ? "Low"
                              : "Critical"}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={cn(
                            "h-full transition-all",
                            selectedTelemetry.batteryPct >= 70
                              ? "bg-green-500"
                              : selectedTelemetry.batteryPct >= 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          )}
                          style={{ width: `${selectedTelemetry.batteryPct}%` }}
                          role="progressbar"
                          aria-valuenow={selectedTelemetry.batteryPct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Battery level"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Speed & GPS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        <Gauge size={14} />
                        Speed
                      </h3>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {selectedTelemetry.speed.toFixed(1)} m/s
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        <Signal size={14} />
                        GPS Quality
                      </h3>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {Math.round(selectedTelemetry.gpsQuality)}%
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Last Update
                    </h3>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100">
                      {formatTimeAgo(selectedTelemetry.timestamp)}
                    </p>
                  </div>

                  {/* Follow Mode Toggle */}
                  <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={followMode}
                        onChange={(e) => setFollowMode(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        Follow drone on map
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
      <ConfirmationDialog
        isOpen={confirmCancel}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancelMission}
        variant="danger"
        title="Cancel Mission"
        message={`Are you sure you want to cancel mission ${activeMission?.id.slice(0, 8)}? This action cannot be undone.`}
      />
    </>
  );
}

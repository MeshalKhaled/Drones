"use client";

import { useState, useReducer, useCallback, useMemo, useOptimistic, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Save, Loader2, CheckCircle2, Play, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { MissionWaypoint } from "@/lib/domain/types";
import { useMissionUIStore } from "@/lib/stores/ui/missionUiStore";
import { createMissionAction, startMissionAction } from "@/app/actions/missions";
import { useDroneMissionStatus } from "@/hooks/data/useDroneMissionStatus";
import { WaypointList } from "./WaypointList";
import { WaypointEditor } from "./WaypointEditor";
import { MissionSummary } from "./MissionSummary";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

// Dynamically import MissionMapCanvas with no SSR
const DynamicMissionMapCanvas = dynamic(
  () => import("./MissionMapCanvas").then((mod) => ({ default: mod.MissionMapCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div className="space-y-2 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400 dark:text-zinc-500" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading map...</p>
        </div>
      </div>
    ),
  }
);

interface MissionPlannerClientProps {
  mapboxToken: string;
  availableDrones: Array<{ id: string; name: string }>;
}

type WaypointActionType =
  | { type: "ADD"; lat: number; lng: number }
  | { type: "DELETE"; id: string }
  | { type: "UPDATE"; id: string; updates: Partial<MissionWaypoint> }
  | { type: "REORDER"; activeId: string; overId: string }
  | { type: "RESET" };

function waypointsReducer(state: MissionWaypoint[], action: WaypointActionType): MissionWaypoint[] {
  switch (action.type) {
    case "ADD": {
      const newWaypoint: MissionWaypoint = {
        id: crypto.randomUUID(),
        lat: action.lat,
        lng: action.lng,
        alt: 50, // Default altitude
        speed: 10, // Default speed
        action: "NONE",
        order: state.length,
      };
      return [...state, newWaypoint];
    }
    case "DELETE": {
      const filtered = state.filter((wp) => wp.id !== action.id);
      // Reorder remaining waypoints
      return filtered.map((wp, index) => ({ ...wp, order: index }));
    }
    case "UPDATE": {
      return state.map((wp) => (wp.id === action.id ? { ...wp, ...action.updates } : wp));
    }
    case "REORDER": {
      const oldIndex = state.findIndex((wp) => wp.id === action.activeId);
      const newIndex = state.findIndex((wp) => wp.id === action.overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const reordered = arrayMove(state, oldIndex, newIndex);
      // Update order indices
      return reordered.map((wp, index) => ({ ...wp, order: index }));
    }
    case "RESET":
      return [];
    default:
      return state;
  }
}

export function MissionPlannerClient({ mapboxToken, availableDrones }: MissionPlannerClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [waypoints, dispatch] = useReducer(waypointsReducer, []);
  const [selectedDroneId, setSelectedDroneId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const { selectedWaypointId, setSelectedWaypointId, editorPanelOpen, summaryPanelOpen } =
    useMissionUIStore();

  // Fetch drone mission status
  const { data: missionStatus } = useDroneMissionStatus();

  const [optimisticMission, addOptimisticMission] = useOptimistic<{
    id: string;
    saving: boolean;
  } | null>(
    null,
    // @ts-expect-error - useOptimistic reducer type inference issue in Next.js 14
    (_state: { id: string; saving: boolean } | null, mission: { id: string; saving: boolean }) =>
      mission
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedWaypoint = useMemo(
    () => waypoints.find((wp) => wp.id === selectedWaypointId) || null,
    [waypoints, selectedWaypointId]
  );

  // Check if selected drone has an active mission
  const selectedDroneMissionStatus = useMemo(() => {
    if (!selectedDroneId || !missionStatus) return null;
    return missionStatus[selectedDroneId] || null;
  }, [selectedDroneId, missionStatus]);

  const selectedDroneHasActiveMission = selectedDroneMissionStatus?.hasActiveMission || false;

  // Check if mission is valid and clear validation errors if it becomes valid
  const isMissionValid = useMemo(() => {
    if (!selectedDroneId) return false;
    if (waypoints.length < 5) return false;
    if (selectedDroneHasActiveMission) return false;
    return true;
  }, [selectedDroneId, waypoints.length, selectedDroneHasActiveMission]);

  // Clear validation errors when mission becomes valid
  useEffect(() => {
    if (hasAttemptedSave && isMissionValid) {
      setHasAttemptedSave(false);
    }
  }, [hasAttemptedSave, isMissionValid]);

  const handleWaypointAdd = useCallback((lat: number, lng: number) => {
    dispatch({ type: "ADD", lat, lng });
  }, []);

  const handleWaypointDelete = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE", id });
      if (selectedWaypointId === id) {
        setSelectedWaypointId(null);
      }
    },
    [selectedWaypointId, setSelectedWaypointId]
  );

  const handleWaypointUpdate = useCallback((id: string, updates: Partial<MissionWaypoint>) => {
    dispatch({ type: "UPDATE", id, updates });
  }, []);

  const handleWaypointSelect = useCallback(
    (id: string) => {
      setSelectedWaypointId(id);
    },
    [setSelectedWaypointId]
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (
      over &&
      active.id !== over.id &&
      typeof active.id === "string" &&
      typeof over.id === "string"
    ) {
      dispatch({ type: "REORDER", activeId: active.id, overId: over.id });
    }
  }, []);

  const handleSave = useCallback(
    async (andStart: boolean = false) => {
      setHasAttemptedSave(true);

      if (!selectedDroneId) {
        toast.error("Please select a drone");
        return;
      }

      if (waypoints.length < 5) {
        toast.error("At least 5 waypoints are required");
        return;
      }

      if (selectedDroneHasActiveMission) {
        toast.error("This drone already has an active mission");
        return;
      }

      setIsSaving(true);
      addOptimisticMission({ id: "optimistic", saving: true });

      try {
        const result = await createMissionAction({
          droneId: selectedDroneId,
          waypoints: waypoints.map((wp) => ({
            ...wp,
            // Ensure order is sequential
            order: waypoints.indexOf(wp),
          })),
        });

        if (result.success && result.data) {
          const missionId = result.data.id;

          if (andStart) {
            // Start mission immediately
            setIsStarting(true);
            const startResult = await startMissionAction(missionId);

            if (startResult.success) {
              toast.success("Mission created and started!");
              // Invalidate queries to update map and telemetry
              queryClient.invalidateQueries({ queryKey: ["drone-mission-status"] });
              queryClient.invalidateQueries({ queryKey: ["active-mission"] });
              queryClient.invalidateQueries({ queryKey: ["drones"] });
              queryClient.invalidateQueries({ queryKey: ["telemetry"] });
              // Navigate to map to see the drone
              setTimeout(() => {
                router.push(`/map?droneId=${selectedDroneId}`);
              }, 1000);
            } else {
              toast.error(startResult.error?.message || "Mission created but failed to start");
              setTimeout(() => {
                router.push("/missions");
              }, 1500);
            }
            setIsStarting(false);
          } else {
            toast.success("Mission created successfully!");
            // Navigate after a short delay
            setTimeout(() => {
              router.push("/missions");
            }, 1500);
          }

          // Reset form and validation state
          dispatch({ type: "RESET" });
          setSelectedDroneId("");
          setSelectedWaypointId(null);
          setHasAttemptedSave(false);
        } else {
          toast.error(result.error?.message || "Failed to create mission");
          addOptimisticMission(null);
          // Keep hasAttemptedSave true to show validation errors
        }
      } catch (error) {
        logger.error("Failed to save mission:", error);
        toast.error("An error occurred while saving the mission");
        addOptimisticMission(null);
      } finally {
        setIsSaving(false);
      }
    },
    [
      selectedDroneId,
      waypoints,
      router,
      addOptimisticMission,
      setSelectedWaypointId,
      selectedDroneHasActiveMission,
      queryClient,
    ]
  );

  const canSave =
    selectedDroneId && waypoints.length >= 5 && !isSaving && !selectedDroneHasActiveMission;

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Map Section */}
      <div className="relative h-[50vh] min-h-[400px] flex-1 lg:h-auto lg:min-h-0">
        <DynamicMissionMapCanvas
          mapboxToken={mapboxToken}
          waypoints={waypoints}
          onWaypointAdd={handleWaypointAdd}
          onWaypointSelect={handleWaypointSelect}
        />
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col gap-4 lg:w-96">
        {/* Drone Selection */}
        <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Select Drone
          </label>
          <select
            value={selectedDroneId}
            onChange={(e) => setSelectedDroneId(e.target.value)}
            className={cn(
              "w-full rounded-md border bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100",
              selectedDroneHasActiveMission
                ? "border-yellow-500 dark:border-yellow-600"
                : "border-zinc-200 dark:border-zinc-800"
            )}
          >
            <option value="">Choose a drone...</option>
            {availableDrones.map((drone) => {
              const status = missionStatus?.[drone.id];
              const hasActive = status?.hasActiveMission;
              return (
                <option key={drone.id} value={drone.id}>
                  {drone.name} {hasActive ? "(has active mission)" : ""}
                </option>
              );
            })}
          </select>

          {/* Active Mission Warning */}
          {selectedDroneHasActiveMission && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="text-sm">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Drone has active mission
                </p>
                <p className="mt-1 text-yellow-600 dark:text-yellow-500">
                  Progress: {(selectedDroneMissionStatus?.currentWaypointIndex ?? 0) + 1}/
                  {selectedDroneMissionStatus?.totalWaypoints} waypoints
                </p>
                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                  Wait for current mission to complete or select a different drone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Panel */}
        {summaryPanelOpen && (
          <MissionSummary
            waypoints={waypoints}
            droneId={selectedDroneId || null}
            showValidationErrors={hasAttemptedSave}
          />
        )}

        {/* Waypoint List */}
        <div className="flex-1 overflow-y-auto rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            Waypoints ({waypoints.length}/5 min)
          </h3>
          {waypoints.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Click on the map to add waypoints. The drone will fly through them in order.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={waypoints.map((wp) => wp.id)}
                strategy={verticalListSortingStrategy}
              >
                <WaypointList
                  waypoints={waypoints}
                  onDelete={handleWaypointDelete}
                  onSelect={handleWaypointSelect}
                />
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Save Button */}
          <button
            onClick={() => handleSave(false)}
            disabled={!canSave}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 font-medium transition-colors",
              canSave
                ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
            )}
          >
            {isSaving && !isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Save & Start Button */}
          <button
            onClick={() => handleSave(true)}
            disabled={!canSave}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 font-medium transition-colors",
              canSave
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
            )}
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Save & Start</span>
              </>
            )}
          </button>
        </div>

        {/* Success State */}
        {optimisticMission?.saving && !isSaving && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-400">
              {isStarting ? "Starting mission..." : "Mission created! Redirecting..."}
            </span>
          </div>
        )}
      </div>

      {/* Waypoint Editor Panel */}
      {editorPanelOpen && selectedWaypoint && (
        <WaypointEditor waypoint={selectedWaypoint} onUpdate={handleWaypointUpdate} />
      )}
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import type { MissionWaypoint, WaypointAction } from "@/lib/domain/types";
import { useMissionUIStore } from "@/lib/stores/ui/missionUiStore";

interface WaypointEditorProps {
  waypoint: MissionWaypoint | null;
  onUpdate: (id: string, updates: Partial<MissionWaypoint>) => void;
}

const WAYPOINT_ACTIONS: WaypointAction[] = [
  "TAKE_PHOTO",
  "LOITER",
  "SCAN",
  "DELIVER_PAYLOAD",
  "NONE",
];

export function WaypointEditor({ waypoint, onUpdate }: WaypointEditorProps) {
  const { editorPanelOpen, setEditorPanelOpen } = useMissionUIStore();

  if (!waypoint || !editorPanelOpen) return null;

  const handleUpdate = (field: keyof MissionWaypoint, value: number | WaypointAction) => {
    onUpdate(waypoint.id, { [field]: value });
  };

  return (
    <div className="absolute right-0 top-0 z-40 flex h-full w-full flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 md:w-96">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Edit Waypoint {waypoint.order + 1}
        </h3>
        <button
          onClick={() => setEditorPanelOpen(false)}
          className="text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
          aria-label="Close editor"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Altitude */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Altitude (meters)
          </label>
          <input
            type="number"
            min={5}
            max={120}
            value={waypoint.alt}
            onChange={(e) => handleUpdate("alt", parseFloat(e.target.value) || 5)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Range: 5-120m</p>
        </div>

        {/* Speed */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Speed (m/s)
          </label>
          <input
            type="number"
            min={1}
            max={25}
            value={waypoint.speed}
            onChange={(e) => handleUpdate("speed", parseFloat(e.target.value) || 1)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Range: 1-25 m/s</p>
        </div>

        {/* Action */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Action
          </label>
          <select
            value={waypoint.action}
            onChange={(e) => handleUpdate("action", e.target.value as WaypointAction)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {WAYPOINT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Coordinates (read-only) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Coordinates
          </label>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Latitude:</span>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                {waypoint.lat.toFixed(6)}
              </div>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Longitude:</span>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                {waypoint.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

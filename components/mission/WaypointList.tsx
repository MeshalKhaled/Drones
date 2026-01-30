"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, MapPin } from "lucide-react";
import type { MissionWaypoint } from "@/lib/domain/types";
import { useMissionUIStore } from "@/lib/stores/ui/missionUiStore";
import { cn } from "@/lib/utils";

interface WaypointListProps {
  waypoints: MissionWaypoint[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

interface WaypointItemProps {
  waypoint: MissionWaypoint;
  index: number;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

function WaypointItem({ waypoint, index, onDelete, onSelect }: WaypointItemProps) {
  const { selectedWaypointId } = useMissionUIStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: waypoint.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedWaypointId === waypoint.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-md border p-3 transition-colors",
        isSelected
          ? "border-blue-500 bg-zinc-100 dark:bg-zinc-800"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-zinc-400 hover:text-zinc-900 active:cursor-grabbing dark:text-zinc-500 dark:hover:text-zinc-100"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <button
        onClick={() => onSelect(waypoint.id)}
        className="flex flex-1 items-center gap-2 text-left transition-colors hover:text-blue-500"
      >
        <MapPin size={16} className="text-blue-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Waypoint {index + 1}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Alt: {waypoint.alt}m | Speed: {waypoint.speed}m/s | {waypoint.action}
          </div>
        </div>
      </button>
      <button
        onClick={() => onDelete(waypoint.id)}
        className="text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500"
        aria-label="Delete waypoint"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function WaypointList({ waypoints, onDelete, onSelect }: WaypointListProps) {
  const sortedWaypoints = [...waypoints].sort((a, b) => a.order - b.order);

  if (sortedWaypoints.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        <MapPin size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No waypoints yet</p>
        <p className="mt-1 text-xs">Click on the map to add waypoints</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedWaypoints.map((waypoint, index) => (
        <WaypointItem
          key={waypoint.id}
          waypoint={waypoint}
          index={index}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

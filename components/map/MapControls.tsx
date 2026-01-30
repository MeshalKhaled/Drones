"use client";

import { Navigation, Layers } from "lucide-react";
import { useMapUIStore } from "@/lib/stores/ui/mapUiStore";
import { cn } from "@/lib/utils";
import { surface, border, text } from "@/lib/theme";

interface MapControlsProps {
  onCenterFleet: () => void;
}

export function MapControls({ onCenterFleet }: MapControlsProps) {
  const { layers, toggleLayer } = useMapUIStore();

  return (
    <div className="absolute right-4 top-4 z-40 flex flex-col gap-2">
      {/* Note: Zoom controls are handled by Mapbox NavigationControl (top-right) */}

      {/* Center Button */}
      <button
        onClick={onCenterFleet}
        className={cn(
          "rounded-md border p-2 shadow-lg transition-colors",
          surface.base,
          border.default,
          surface.hover
        )}
        aria-label="Center to fleet"
      >
        <Navigation size={18} className={text.primary} />
      </button>

      {/* Layers Toggle */}
      <div
        className={cn("overflow-hidden rounded-md border shadow-lg", surface.base, border.default)}
      >
        <div className={cn("flex items-center gap-2 border-b p-2", border.default)}>
          <Layers size={14} className={text.muted} />
          <span className={cn("text-xs", text.muted)}>Layers</span>
        </div>
        <button
          onClick={() => toggleLayer("markers")}
          className={cn(
            "w-full border-b px-3 py-2 text-left text-xs transition-colors",
            border.default,
            surface.hover,
            layers.markers ? text.primary : text.muted
          )}
        >
          <div className="flex items-center justify-between">
            <span>Markers</span>
            <div
              className={cn(
                "h-3 w-3 rounded border",
                layers.markers ? "border-green-500 bg-green-500" : border.default
              )}
            />
          </div>
        </button>
        <button
          onClick={() => toggleLayer("trails")}
          className={cn(
            "w-full px-3 py-2 text-left text-xs transition-colors",
            surface.hover,
            layers.trails ? text.primary : text.muted
          )}
        >
          <div className="flex items-center justify-between">
            <span>Trails</span>
            <div
              className={cn(
                "h-3 w-3 rounded border",
                layers.trails ? "border-blue-500 bg-blue-500" : border.default
              )}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

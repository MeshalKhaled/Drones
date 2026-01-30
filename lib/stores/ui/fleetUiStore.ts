import { create } from "zustand";
import type { DroneStatus } from "@/lib/domain/types";

type ViewMode = "grid" | "list";

interface FleetUIState {
  // View state
  viewMode: ViewMode;

  // Filter state
  filtersPanelOpen: boolean;
  selectedStatuses: DroneStatus[];

  // Sort state
  sort: "name" | "status" | "batteryPct" | "updatedAt" | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setFiltersPanelOpen: (open: boolean) => void;
  toggleStatusFilter: (status: DroneStatus) => void;
  clearStatusFilters: () => void;
  setSort: (sort: "name" | "status" | "batteryPct" | "updatedAt" | null) => void;
}

export const useFleetUIStore = create<FleetUIState>((set) => ({
  viewMode: "grid",
  filtersPanelOpen: false,
  selectedStatuses: [],
  sort: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setFiltersPanelOpen: (open) => set({ filtersPanelOpen: open }),
  toggleStatusFilter: (status) =>
    set((state) => ({
      selectedStatuses: state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter((s) => s !== status)
        : [...state.selectedStatuses, status],
    })),
  clearStatusFilters: () => set({ selectedStatuses: [] }),
  setSort: (sort) => set({ sort }),
}));

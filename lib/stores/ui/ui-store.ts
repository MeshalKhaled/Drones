import { create } from "zustand";

type ViewMode = "grid" | "list";

interface UIState {
  // Fleet view state
  viewMode: ViewMode;
  filtersPanelOpen: boolean;
  selectedDroneId: string | null;
  sort: "name" | "status" | "batteryPct" | "updatedAt" | null;
  searchQuery: string;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setFiltersPanelOpen: (open: boolean) => void;
  setSelectedDroneId: (id: string | null) => void;
  setSort: (sort: "name" | "status" | "batteryPct" | "updatedAt" | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "grid",
  filtersPanelOpen: false,
  selectedDroneId: null,
  sort: null,
  searchQuery: "",

  setViewMode: (mode) => set({ viewMode: mode }),
  setFiltersPanelOpen: (open) => set({ filtersPanelOpen: open }),
  setSelectedDroneId: (id) => set({ selectedDroneId: id }),
  setSort: (sort) => set({ sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

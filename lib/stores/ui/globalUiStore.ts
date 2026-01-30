import { create } from "zustand";

interface GlobalUIState {
  // Selected drone ID (shared across fleet/map/details)
  selectedDroneId: string | null;

  // Actions
  setSelectedDroneId: (id: string | null) => void;
}

export const useGlobalUIStore = create<GlobalUIState>((set) => ({
  selectedDroneId: null,

  setSelectedDroneId: (id) => set({ selectedDroneId: id }),
}));

import { create } from "zustand";

interface MapUIState {
  // Selected drone
  selectedDroneId: string | null;

  // Panel state
  panelOpen: boolean;

  // Layer toggles
  layers: {
    markers: boolean;
    trails: boolean;
    heatmap: boolean;
  };

  // Follow mode (center map on selected drone)
  followMode: boolean;

  // Actions
  setSelectedDroneId: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  toggleLayer: (layer: keyof MapUIState["layers"]) => void;
  setFollowMode: (enabled: boolean) => void;
  openDronePanel: (droneId: string) => void;
  closeDronePanel: () => void;
}

export const useMapUIStore = create<MapUIState>((set) => ({
  selectedDroneId: null,
  panelOpen: false,
  layers: {
    markers: true,
    trails: true,
    heatmap: false,
  },
  followMode: false,

  setSelectedDroneId: (id) => set({ selectedDroneId: id }),
  setPanelOpen: (open) => set({ panelOpen: open }),
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  setFollowMode: (enabled) => set({ followMode: enabled }),
  openDronePanel: (droneId) => set({ selectedDroneId: droneId, panelOpen: true }),
  closeDronePanel: () => set({ selectedDroneId: null, panelOpen: false }),
}));

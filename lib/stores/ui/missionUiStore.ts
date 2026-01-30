import { create } from "zustand";

interface MissionUIState {
  selectedWaypointId: string | null;
  editorPanelOpen: boolean;
  summaryPanelOpen: boolean;
  setSelectedWaypointId: (id: string | null) => void;
  setEditorPanelOpen: (open: boolean) => void;
  setSummaryPanelOpen: (open: boolean) => void;
}

export const useMissionUIStore = create<MissionUIState>((set) => ({
  selectedWaypointId: null,
  editorPanelOpen: false,
  summaryPanelOpen: true, // Summary panel open by default
  setSelectedWaypointId: (id) => set({ selectedWaypointId: id, editorPanelOpen: id !== null }),
  setEditorPanelOpen: (open) => set({ editorPanelOpen: open }),
  setSummaryPanelOpen: (open) => set({ summaryPanelOpen: open }),
}));

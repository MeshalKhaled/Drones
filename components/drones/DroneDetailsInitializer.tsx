"use client";

import { useEffect } from "react";
import { useGlobalUIStore } from "@/lib/stores/ui/globalUiStore";

interface DroneDetailsInitializerProps {
  droneId: string;
}

export function DroneDetailsInitializer({ droneId }: DroneDetailsInitializerProps) {
  const setSelectedDroneId = useGlobalUIStore((state) => state.setSelectedDroneId);

  useEffect(() => {
    setSelectedDroneId(droneId);
    return () => {
      // Optionally clear on unmount, but we might want to keep it
      // setSelectedDroneId(null);
    };
  }, [droneId, setSelectedDroneId]);

  return null;
}

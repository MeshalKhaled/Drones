/**
 * Static drone profile data
 * This file contains ONLY static data and is safe for client-side imports
 */

import type { DroneStatus } from "../domain/types";

export interface DroneProfile {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
}

export interface DroneInitialState {
  id: string;
  name: string;
  status: DroneStatus;
  batteryPct: number;
  flightHours: number;
  lastMission: string | null;
  updatedAt: string;
  position: { lat: number; lng: number; alt: number; speed: number };
  health: { signalStrength: number; gpsQuality: number; motorHealth: number; overall: number };
}

/**
 * Static drone profiles - safe for client import
 */
export const droneProfiles: DroneProfile[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Alpha-01",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-A001",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Beta-02",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-B002",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Gamma-03",
    model: "DJI Air 2S",
    serialNumber: "DJA2-G003",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Delta-04",
    model: "DJI Mini 3 Pro",
    serialNumber: "DJM3P-D004",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Echo-05",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-E005",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Foxtrot-06",
    model: "DJI Air 2S",
    serialNumber: "DJA2-F006",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Golf-07",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-G007",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Hotel-08",
    model: "DJI Mini 3 Pro",
    serialNumber: "DJM3P-H008",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "India-09",
    model: "DJI Air 2S",
    serialNumber: "DJA2-I009",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "Juliet-10",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-J010",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Kilo-11",
    model: "DJI Air 2S",
    serialNumber: "DJA2-K011",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "Lima-12",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-L012",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Mike-13",
    model: "DJI Mini 3 Pro",
    serialNumber: "DJM3P-M013",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    name: "November-14",
    model: "DJI Air 2S",
    serialNumber: "DJA2-N014",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    name: "Oscar-15",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-O015",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    name: "Papa-16",
    model: "DJI Air 2S",
    serialNumber: "DJA2-P016",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440016",
    name: "Quebec-17",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-Q017",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440017",
    name: "Romeo-18",
    model: "DJI Mini 3 Pro",
    serialNumber: "DJM3P-R018",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440018",
    name: "Sierra-19",
    model: "DJI Air 2S",
    serialNumber: "DJA2-S019",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440019",
    name: "Tango-20",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-T020",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440020",
    name: "Uniform-21",
    model: "DJI Air 2S",
    serialNumber: "DJA2-U021",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440021",
    name: "Victor-22",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-V022",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440022",
    name: "Whiskey-23",
    model: "DJI Mini 3 Pro",
    serialNumber: "DJM3P-W023",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440023",
    name: "Xray-24",
    model: "DJI Air 2S",
    serialNumber: "DJA2-X024",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440024",
    name: "Yankee-25",
    model: "DJI Mavic 3",
    serialNumber: "DJM3-Y025",
  },
];

/**
 * Get drone name by ID - safe for client use
 */
export function getDroneName(droneId: string): string {
  const profile = droneProfiles.find((d) => d.id === droneId);
  return profile?.name ?? "Unknown Drone";
}

/**
 * Get drone profile by ID - safe for client use
 */
export function getDroneProfile(droneId: string): DroneProfile | null {
  return droneProfiles.find((d) => d.id === droneId) ?? null;
}

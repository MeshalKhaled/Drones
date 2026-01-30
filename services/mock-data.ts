import type { Drone, Mission, Telemetry, DroneStatus } from "@/lib/domain/types";

// Mock drones dataset (25+ drones)
export const mockDrones: Drone[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Alpha-01",
    status: "online",
    batteryPct: 87,
    flightHours: 245.5,
    lastMission: "660e8400-e29b-41d4-a716-446655440001",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.7749, lng: -122.4194, alt: 120, speed: 15.5 },
    health: { signalStrength: 95, gpsQuality: 98, motorHealth: 92, overall: 95 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Beta-02",
    status: "in-mission",
    batteryPct: 65,
    flightHours: 189.2,
    lastMission: "660e8400-e29b-41d4-a716-446655440002",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.7849, lng: -122.4094, alt: 85, speed: 22.3 },
    health: { signalStrength: 88, gpsQuality: 92, motorHealth: 90, overall: 90 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Gamma-03",
    status: "charging",
    batteryPct: 45,
    flightHours: 312.8,
    lastMission: "660e8400-e29b-41d4-a716-446655440003",
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    position: { lat: 37.7649, lng: -122.4294, alt: 0, speed: 0 },
    health: { signalStrength: 100, gpsQuality: 100, motorHealth: 85, overall: 95 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Delta-04",
    status: "online",
    batteryPct: 92,
    flightHours: 156.3,
    lastMission: null,
    updatedAt: new Date().toISOString(),
    position: { lat: 37.7549, lng: -122.4394, alt: 0, speed: 0 },
    health: { signalStrength: 92, gpsQuality: 95, motorHealth: 88, overall: 92 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Echo-05",
    status: "offline",
    batteryPct: 12,
    flightHours: 421.7,
    lastMission: "660e8400-e29b-41d4-a716-446655440004",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    position: { lat: 37.7449, lng: -122.4494, alt: 0, speed: 0 },
    health: { signalStrength: 0, gpsQuality: 0, motorHealth: 75, overall: 25 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Foxtrot-06",
    status: "online",
    batteryPct: 78,
    flightHours: 203.1,
    lastMission: "660e8400-e29b-41d4-a716-446655440005",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.7349, lng: -122.4594, alt: 95, speed: 18.2 },
    health: { signalStrength: 90, gpsQuality: 93, motorHealth: 87, overall: 90 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Golf-07",
    status: "in-mission",
    batteryPct: 54,
    flightHours: 278.9,
    lastMission: "660e8400-e29b-41d4-a716-446655440006",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.7249, lng: -122.4694, alt: 110, speed: 20.5 },
    health: { signalStrength: 85, gpsQuality: 88, motorHealth: 82, overall: 85 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Hotel-08",
    status: "charging",
    batteryPct: 38,
    flightHours: 167.4,
    lastMission: "660e8400-e29b-41d4-a716-446655440007",
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    position: { lat: 37.7149, lng: -122.4794, alt: 0, speed: 0 },
    health: { signalStrength: 98, gpsQuality: 97, motorHealth: 91, overall: 95 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "India-09",
    status: "online",
    batteryPct: 96,
    flightHours: 134.6,
    lastMission: null,
    updatedAt: new Date().toISOString(),
    position: { lat: 37.7049, lng: -122.4894, alt: 0, speed: 0 },
    health: { signalStrength: 94, gpsQuality: 96, motorHealth: 89, overall: 93 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "Juliet-10",
    status: "offline",
    batteryPct: 8,
    flightHours: 389.2,
    lastMission: "660e8400-e29b-41d4-a716-446655440008",
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    position: { lat: 37.6949, lng: -122.4994, alt: 0, speed: 0 },
    health: { signalStrength: 0, gpsQuality: 0, motorHealth: 70, overall: 23 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "Kilo-11",
    status: "online",
    batteryPct: 83,
    flightHours: 221.8,
    lastMission: "660e8400-e29b-41d4-a716-446655440009",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.6849, lng: -122.5094, alt: 105, speed: 16.8 },
    health: { signalStrength: 91, gpsQuality: 94, motorHealth: 86, overall: 90 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "Lima-12",
    status: "in-mission",
    batteryPct: 61,
    flightHours: 295.3,
    lastMission: "660e8400-e29b-41d4-a716-446655440010",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.6749, lng: -122.5194, alt: 92, speed: 19.4 },
    health: { signalStrength: 87, gpsQuality: 90, motorHealth: 84, overall: 87 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Mike-13",
    status: "charging",
    batteryPct: 42,
    flightHours: 178.5,
    lastMission: "660e8400-e29b-41d4-a716-446655440011",
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    position: { lat: 37.6649, lng: -122.5294, alt: 0, speed: 0 },
    health: { signalStrength: 97, gpsQuality: 99, motorHealth: 90, overall: 95 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    name: "November-14",
    status: "online",
    batteryPct: 89,
    flightHours: 145.2,
    lastMission: null,
    updatedAt: new Date().toISOString(),
    position: { lat: 37.6549, lng: -122.5394, alt: 0, speed: 0 },
    health: { signalStrength: 93, gpsQuality: 95, motorHealth: 88, overall: 92 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    name: "Oscar-15",
    status: "offline",
    batteryPct: 15,
    flightHours: 356.7,
    lastMission: "660e8400-e29b-41d4-a716-446655440012",
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
    position: { lat: 37.6449, lng: -122.5494, alt: 0, speed: 0 },
    health: { signalStrength: 0, gpsQuality: 0, motorHealth: 72, overall: 24 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440015",
    name: "Papa-16",
    status: "online",
    batteryPct: 76,
    flightHours: 198.4,
    lastMission: "660e8400-e29b-41d4-a716-446655440013",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.6349, lng: -122.5594, alt: 88, speed: 17.1 },
    health: { signalStrength: 89, gpsQuality: 92, motorHealth: 85, overall: 89 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440016",
    name: "Quebec-17",
    status: "in-mission",
    batteryPct: 58,
    flightHours: 267.1,
    lastMission: "660e8400-e29b-41d4-a716-446655440014",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.6249, lng: -122.5694, alt: 98, speed: 21.7 },
    health: { signalStrength: 86, gpsQuality: 89, motorHealth: 83, overall: 86 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440017",
    name: "Romeo-18",
    status: "charging",
    batteryPct: 35,
    flightHours: 189.6,
    lastMission: "660e8400-e29b-41d4-a716-446655440015",
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    position: { lat: 37.6149, lng: -122.5794, alt: 0, speed: 0 },
    health: { signalStrength: 96, gpsQuality: 98, motorHealth: 89, overall: 94 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440018",
    name: "Sierra-19",
    status: "online",
    batteryPct: 94,
    flightHours: 112.3,
    lastMission: null,
    updatedAt: new Date().toISOString(),
    position: { lat: 37.6049, lng: -122.5894, alt: 0, speed: 0 },
    health: { signalStrength: 92, gpsQuality: 94, motorHealth: 87, overall: 91 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440019",
    name: "Tango-20",
    status: "offline",
    batteryPct: 11,
    flightHours: 402.5,
    lastMission: "660e8400-e29b-41d4-a716-446655440016",
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    position: { lat: 37.5949, lng: -122.5994, alt: 0, speed: 0 },
    health: { signalStrength: 0, gpsQuality: 0, motorHealth: 68, overall: 23 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440020",
    name: "Uniform-21",
    status: "online",
    batteryPct: 81,
    flightHours: 234.7,
    lastMission: "660e8400-e29b-41d4-a716-446655440017",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.5849, lng: -122.6094, alt: 100, speed: 15.9 },
    health: { signalStrength: 90, gpsQuality: 93, motorHealth: 86, overall: 90 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440021",
    name: "Victor-22",
    status: "in-mission",
    batteryPct: 63,
    flightHours: 281.2,
    lastMission: "660e8400-e29b-41d4-a716-446655440018",
    updatedAt: new Date().toISOString(),
    position: { lat: 37.5749, lng: -122.6194, alt: 106, speed: 23.1 },
    health: { signalStrength: 88, gpsQuality: 91, motorHealth: 84, overall: 88 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440022",
    name: "Whiskey-23",
    status: "charging",
    batteryPct: 40,
    flightHours: 165.8,
    lastMission: "660e8400-e29b-41d4-a716-446655440019",
    updatedAt: new Date(Date.now() - 1500000).toISOString(),
    position: { lat: 37.5649, lng: -122.6294, alt: 0, speed: 0 },
    health: { signalStrength: 99, gpsQuality: 100, motorHealth: 92, overall: 97 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440023",
    name: "Xray-24",
    status: "online",
    batteryPct: 91,
    flightHours: 128.9,
    lastMission: null,
    updatedAt: new Date().toISOString(),
    position: { lat: 37.5549, lng: -122.6394, alt: 0, speed: 0 },
    health: { signalStrength: 95, gpsQuality: 97, motorHealth: 90, overall: 94 },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440024",
    name: "Yankee-25",
    status: "offline",
    batteryPct: 9,
    flightHours: 374.3,
    lastMission: "660e8400-e29b-41d4-a716-446655440020",
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    position: { lat: 37.5449, lng: -122.6494, alt: 0, speed: 0 },
    health: { signalStrength: 0, gpsQuality: 0, motorHealth: 69, overall: 23 },
  },
];

// Generate unique UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate missions with unique IDs and realistic time distribution
function generateMissions(): Mission[] {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  const missions: Mission[] = [];
  const missionIds = new Set<string>(); // Track IDs to ensure uniqueness
  const dronesWithInProgressMission = new Set<string>(); // Track drones that have in-progress missions

  // First, create in-progress missions for all drones with "in-mission" status
  const inMissionDrones = mockDrones.filter((d) => d.status === "in-mission");
  for (const drone of inMissionDrones) {
    let missionId: string;
    do {
      missionId = generateUUID();
    } while (missionIds.has(missionId));
    missionIds.add(missionId);
    dronesWithInProgressMission.add(drone.id);

    const createdAt = new Date(now - Math.random() * 2 * 60 * 60 * 1000); // Created within last 2 hours
    const startTime = new Date(createdAt.getTime() + Math.random() * 5 * 60 * 1000).toISOString(); // Started within 5 min

    // Generate 5-8 waypoints for active missions
    // Waypoints spread ~100-200m apart (0.001-0.002 degrees) for realistic flight paths
    const waypointCount = 5 + Math.floor(Math.random() * 4);
    const waypoints: Mission["waypoints"] = [];
    let lastLat = drone.position.lat;
    let lastLng = drone.position.lng;
    for (let j = 0; j < waypointCount; j++) {
      // Each waypoint is ~100-200m from the previous one
      lastLat += (Math.random() - 0.5) * 0.002; // ~100-200m
      lastLng += (Math.random() - 0.5) * 0.002;
      waypoints.push({
        lat: lastLat,
        lng: lastLng,
        alt: 50 + Math.random() * 100,
        order: j,
      });
    }

    missions.push({
      id: missionId,
      droneId: drone.id,
      status: "in-progress",
      startTime,
      endTime: null,
      success: false,
      waypoints,
      createdAt: createdAt.toISOString(),
      updatedAt: startTime,
      currentWaypointIndex: Math.floor(Math.random() * Math.min(3, waypoints.length)), // Random progress
    } as Mission);
  }

  // Status distribution for remaining missions (no in-progress since those are handled above)
  const statusDistribution: Array<{ status: Mission["status"]; weight: number }> = [
    { status: "completed", weight: 0.55 }, // 55% completed
    { status: "failed", weight: 0.2 }, // 20% failed
    { status: "pending", weight: 0.2 }, // 20% pending
    { status: "cancelled", weight: 0.05 }, // 5% cancelled
  ];

  // Generate remaining missions (target 55 total)
  const remainingCount = Math.max(0, 55 - missions.length);
  for (let i = 0; i < remainingCount; i++) {
    // Generate unique ID
    let missionId: string;
    do {
      missionId = generateUUID();
    } while (missionIds.has(missionId));
    missionIds.add(missionId);

    // Select random drone (excluding drones with in-progress missions for now)
    const availableDrones = mockDrones.filter((d) => !dronesWithInProgressMission.has(d.id));
    const drone =
      availableDrones.length > 0
        ? availableDrones[Math.floor(Math.random() * availableDrones.length)]
        : mockDrones[Math.floor(Math.random() * mockDrones.length)];
    if (!drone) continue;

    // Select status based on distribution
    const rand = Math.random();
    let cumulativeWeight = 0;
    let selectedStatus: Mission["status"] = "pending";
    for (const { status, weight } of statusDistribution) {
      cumulativeWeight += weight;
      if (rand <= cumulativeWeight) {
        selectedStatus = status;
        break;
      }
    }

    // Distribute createdAt across last 30 days (more recent = more likely)
    // Use exponential distribution to favor recent missions
    const daysAgo = Math.pow(Math.random(), 2) * 30; // Square to favor recent
    const createdAt = new Date(thirtyDaysAgo + daysAgo * 24 * 60 * 60 * 1000);

    // Generate startTime (null for pending, otherwise after createdAt)
    let startTime: string | null = null;
    if (selectedStatus !== "pending") {
      const hoursAfterCreation = Math.random() * 48; // Start within 48h of creation
      startTime = new Date(createdAt.getTime() + hoursAfterCreation * 60 * 60 * 1000).toISOString();
    }

    // Generate endTime based on status
    let endTime: string | null = null;
    if (selectedStatus === "completed" || selectedStatus === "failed") {
      // Duration: 15-90 minutes
      const durationMinutes = 15 + Math.random() * 75;
      const startDate = startTime ? new Date(startTime) : createdAt;
      endTime = new Date(startDate.getTime() + durationMinutes * 60 * 1000).toISOString();
    }

    // Generate waypoints (3-8 waypoints)
    const waypointCount = 3 + Math.floor(Math.random() * 6);
    const waypoints: Mission["waypoints"] = [];
    for (let j = 0; j < waypointCount; j++) {
      waypoints.push({
        lat: drone.position.lat + (Math.random() - 0.5) * 0.1,
        lng: drone.position.lng + (Math.random() - 0.5) * 0.1,
        alt: 50 + Math.random() * 100,
        order: j,
      });
    }

    // Determine success (only completed missions can be successful)
    const success = selectedStatus === "completed" && Math.random() > 0.1; // 90% success rate for completed

    // UpdatedAt: same as endTime for completed/failed, startTime for in-progress, createdAt for others
    let updatedAt: Date;
    if (endTime) {
      updatedAt = new Date(endTime);
    } else if (startTime) {
      updatedAt = new Date(startTime);
    } else {
      updatedAt = createdAt;
    }

    missions.push({
      id: missionId,
      droneId: drone.id,
      status: selectedStatus,
      startTime,
      endTime,
      success,
      waypoints,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    } satisfies Mission);
  }

  return missions;
}

// Mock missions dataset (55 missions with unique IDs and realistic times)
export const mockMissions: Mission[] = generateMissions();

// In-memory position tracking for movement simulation
const positionHistory = new Map<string, Array<{ lat: number; lng: number; timestamp: number }>>();

// Generate telemetry data dynamically (simulates real-time updates)
// Returns 20+ drones for fleet scope
export function generateTelemetry(droneId?: string): Telemetry[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const droneStore = require("../lib/stores/drone-store");
  const { listDronesWithState, getRuntimeStateForTelemetry, updateRuntimeState } = droneStore;

  const now = Date.now();
  const dt = 1.0; // 1 second per update

  // Get runtime state for telemetry
  const runtimeStates = getRuntimeStateForTelemetry();

  // Get drones with state (explicit type to avoid inference issues)
  type DroneWithStateType = {
    profile: {
      id: string;
      name: string;
      flightHours: number;
      lastMission: string | null;
      health: { signalStrength: number; gpsQuality: number; motorHealth: number; overall: number };
    };
    runtime: {
      status: string;
      position: { lat: number; lng: number; alt: number; speed: number };
      batteryPct: number;
      updatedAt: string;
      baseAnchor: { lat: number; lng: number };
    };
  };

  let dronesWithState: DroneWithStateType[] = listDronesWithState() as DroneWithStateType[];

  if (droneId) {
    dronesWithState = dronesWithState.filter((d: DroneWithStateType) => d.profile.id === droneId);
  } else {
    // For fleet scope, return all active drones (online or in-mission)
    // Ensure we return at least 20 drones by including some charging/offline
    const activeDrones = dronesWithState.filter(
      (d: DroneWithStateType) => d.runtime.status === "online" || d.runtime.status === "in-mission"
    );
    const otherDrones = dronesWithState.filter(
      (d: DroneWithStateType) => d.runtime.status !== "online" && d.runtime.status !== "in-mission"
    );

    // Take all active + enough others to reach 20+
    const needed = Math.max(0, 20 - activeDrones.length);
    dronesWithState = [...activeDrones, ...otherDrones.slice(0, needed)];
  }

  // Get active missions for mission-following logic
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const missionStore = require("../lib/stores/mission-store");
  const { getActiveMissionForDrone, advanceMissionWaypoint } = missionStore;

  return dronesWithState.map((droneWithState) => {
    const drone = droneWithState.profile;
    const runtime = droneWithState.runtime;

    // Get command state from runtime
    const commandState = runtimeStates.get(drone.id);
    const effectiveStatus: DroneStatus =
      (commandState?.status as DroneStatus) || (runtime.status as DroneStatus);
    const isReturning = commandState?.returning || false;
    const targetAltitude = commandState?.targetAltitude;
    // Get activeMissionId from commandState (which includes it) or fallback to runtime
    const activeMissionId =
      commandState?.activeMissionId ??
      (runtime as { activeMissionId?: string | null }).activeMissionId ??
      null;

    // Check if drone has an active mission
    // First check explicit activeMissionId, then fall back to looking up by drone status
    let activeMission = null;
    if (activeMissionId) {
      activeMission = getActiveMissionForDrone(drone.id);
    } else if (effectiveStatus === "in-mission") {
      // Fallback: look for any in-progress mission for this drone
      activeMission = getActiveMissionForDrone(drone.id);
      // If found, sync the activeMissionId to runtime state
      if (activeMission) {
        updateRuntimeState(drone.id, { activeMissionId: activeMission.id });
      }
    }

    // Get motion profile for this drone (used for fallback movement)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const motionStore = require("../lib/stores/drone-motion-store");
    // Create a temporary Drone object for motion profile (uses profile + runtime position)
    const tempDrone: Drone = {
      id: drone.id,
      name: drone.name,
      status: runtime.status as DroneStatus,
      batteryPct: runtime.batteryPct,
      flightHours: drone.flightHours,
      lastMission: drone.lastMission,
      updatedAt: runtime.updatedAt,
      position: runtime.position,
      health: drone.health,
    };
    const profile = motionStore.getMotionProfile(tempDrone);
    const motionState = motionStore.getMotionState(drone.id);
    const updateMotionState = motionStore.updateMotionState;

    // Get or initialize position history for this drone
    const history = positionHistory.get(drone.id) || [];

    // Simulate movement based on drone status and commands
    let newLat = runtime.position.lat;
    let newLng = runtime.position.lng;
    let newSpeed = 0;
    let newAlt = runtime.position.alt;

    // Random offline simulation (5% chance, temporary)
    const isRandomOffline = Math.random() < 0.05 && effectiveStatus === "online";

    // MISSION-FOLLOWING LOGIC: If drone has active mission, follow waypoints
    let updatedActiveMissionId = activeMissionId;
    let finalStatus = effectiveStatus;

    // Check for mission failure conditions BEFORE processing waypoints
    if (activeMission && activeMission.status === "in-progress") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { completeMission } = require("../lib/stores/mission-store");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getDroneRuntimeState } = require("../lib/stores/drone-store");

      const currentRuntime = getDroneRuntimeState(drone.id);
      const currentBattery = runtime.batteryPct;
      const currentGpsQuality = drone.health.gpsQuality;
      const offlineSince = currentRuntime?.offlineSince;

      // Check battery < 5%
      if (currentBattery < 5) {
        completeMission(activeMission.id, false, "LOW_BATTERY");
        updatedActiveMissionId = null;
        finalStatus = "online";
        activeMission = null; // Clear reference
      }
      // Check GPS < 20%
      else if (currentGpsQuality < 20) {
        completeMission(activeMission.id, false, "LOW_GPS");
        updatedActiveMissionId = null;
        finalStatus = "online";
        activeMission = null; // Clear reference
      }
      // Check offline timeout > 30 seconds
      else if (offlineSince && effectiveStatus === "offline") {
        const offlineDuration = now - new Date(offlineSince).getTime();
        if (offlineDuration > 30000) {
          // 30 seconds
          completeMission(activeMission.id, false, "OFFLINE_TIMEOUT");
          updatedActiveMissionId = null;
          finalStatus = "offline";
          activeMission = null; // Clear reference
        }
      }
    }

    if (activeMission && activeMission.waypoints.length > 0 && !isReturning && activeMission.status === "in-progress") {
      // Sort waypoints by order field to ensure correct sequence
      const sortedWaypoints = [...activeMission.waypoints].sort((a, b) => a.order - b.order);
      const currentWaypointIndex = activeMission.currentWaypointIndex ?? 0;
      const currentWaypoint = sortedWaypoints[currentWaypointIndex];

      if (currentWaypoint) {
        // Calculate distance to current waypoint (Haversine formula)
        const R = 6371000; // Earth radius in meters
        const dLat = ((currentWaypoint.lat - runtime.position.lat) * Math.PI) / 180;
        const dLng = ((currentWaypoint.lng - runtime.position.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((runtime.position.lat * Math.PI) / 180) *
            Math.cos((currentWaypoint.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceToWaypoint = R * c; // meters

        const waypointThreshold = 50; // meters - consider waypoint reached when within 50m

        // Check if waypoint action is still executing (delay)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const executionStore = require("../lib/stores/mission-execution-store");
        const { isWaypointActionExecuting, startWaypointAction, addMissionEvent } = executionStore;

        const waypointAction = currentWaypoint.action || "NONE";
        const isActionExecuting = isWaypointActionExecuting(
          activeMission.id,
          currentWaypointIndex,
          now
        );

        if (distanceToWaypoint < waypointThreshold) {
          // Waypoint reached
          if (waypointAction !== "NONE" && !isActionExecuting) {
            // Start action execution (first time reaching waypoint)
            addMissionEvent(activeMission.id, {
              type: "WAYPOINT_REACHED",
              waypointIndex: currentWaypointIndex,
              message: `Reached waypoint ${currentWaypointIndex + 1}`,
            });
            startWaypointAction(activeMission.id, currentWaypointIndex, waypointAction, now);
            // Stay at waypoint for action duration
            newLat = runtime.position.lat;
            newLng = runtime.position.lng;
            newSpeed = 0;
            newAlt = currentWaypoint.alt;
          } else if (waypointAction !== "NONE" && isActionExecuting) {
            // Action still executing, stay at waypoint
            newLat = runtime.position.lat;
            newLng = runtime.position.lng;
            newSpeed = 0;
            newAlt = currentWaypoint.alt;
          } else {
            // No action or action completed, advance immediately
            addMissionEvent(activeMission.id, {
              type: "WAYPOINT_REACHED",
              waypointIndex: currentWaypointIndex,
              message: `Reached waypoint ${currentWaypointIndex + 1}`,
            });
            const advancedMission = advanceMissionWaypoint(activeMission.id);

            // Check if mission was completed
            if (advancedMission && advancedMission.status !== "in-progress") {
              // Mission completed, stop movement
              newSpeed = 0;
              newAlt = 0;
              // Position stays at final waypoint
              const finalWaypoint = sortedWaypoints[sortedWaypoints.length - 1];
              if (finalWaypoint) {
                newLat = finalWaypoint.lat;
                newLng = finalWaypoint.lng;
              }
              // Clear activeMissionId (will be handled in updateRuntimeState)
              updatedActiveMissionId = null;
              finalStatus = "online";
            } else if (advancedMission) {
              // Mission still in progress, move toward next waypoint
              const nextIndex = advancedMission.currentWaypointIndex ?? 0;
              // Re-sort in case waypoints were modified (though unlikely)
              const advancedSortedWaypoints = [...advancedMission.waypoints].sort(
                (a, b) => a.order - b.order
              );
              const nextWaypoint = advancedSortedWaypoints[nextIndex];
              if (nextWaypoint) {
                const lat1Rad = (runtime.position.lat * Math.PI) / 180;
                const lat2Rad = (nextWaypoint.lat * Math.PI) / 180;
                const dLngRad = ((nextWaypoint.lng - runtime.position.lng) * Math.PI) / 180;

                const y = Math.sin(dLngRad) * Math.cos(lat2Rad);
                const x =
                  Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLngRad);
                const bearing = Math.atan2(y, x);

                // Use waypoint speed if available, otherwise default to 10 m/s
                const missionSpeed = nextWaypoint.speed || 10;
                const distance = missionSpeed * dt;
                const latDelta = (distance / R) * (180 / Math.PI);
                const lngDelta = ((distance / R) * (180 / Math.PI)) / Math.cos(lat1Rad);

                newLat = runtime.position.lat + Math.cos(bearing) * latDelta;
                newLng = runtime.position.lng + Math.sin(bearing) * lngDelta;
                newSpeed = missionSpeed;
                newAlt = nextWaypoint.alt; // Use next waypoint altitude
              }
            }
          }
        } else {
          // Move toward current waypoint (linear interpolation)
          // Calculate bearing (direction to waypoint)
          const lat1Rad = (runtime.position.lat * Math.PI) / 180;
          const lat2Rad = (currentWaypoint.lat * Math.PI) / 180;
          const dLngRad = ((currentWaypoint.lng - runtime.position.lng) * Math.PI) / 180;

          const y = Math.sin(dLngRad) * Math.cos(lat2Rad);
          const x =
            Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLngRad);
          const bearing = Math.atan2(y, x);

          // Use waypoint speed if available, otherwise default to 10 m/s
          const missionSpeed = currentWaypoint.speed || 10;
          const distance = missionSpeed * dt;
          const earthRadius = 6371000;
          const latDelta = (distance / earthRadius) * (180 / Math.PI);
          const lngDelta = ((distance / earthRadius) * (180 / Math.PI)) / Math.cos(lat1Rad);

          // Move toward waypoint
          newLat = runtime.position.lat + Math.cos(bearing) * latDelta;
          newLng = runtime.position.lng + Math.sin(bearing) * lngDelta;
          newSpeed = missionSpeed;

          // Interpolate altitude toward waypoint altitude
          const currentAlt = runtime.position.alt;
          const targetAlt = currentWaypoint.alt;
          const altDiff = targetAlt - currentAlt;
          const altChangeRate = 2; // m/s vertical speed

          if (Math.abs(altDiff) > 1) {
            newAlt =
              currentAlt + Math.sign(altDiff) * Math.min(Math.abs(altDiff), altChangeRate * dt);
          } else {
            newAlt = targetAlt;
          }
        }
      }
    } else if (
      (effectiveStatus === "online" || effectiveStatus === "in-mission") &&
      !isRandomOffline
    ) {
      // Get current heading or initialize
      let currentHeading = motionState?.heading ?? profile.heading;

      // Update heading with turn rate and wobble
      const timeSeconds = now / 1000;
      const wobble = Math.sin(timeSeconds * 0.1 + profile.phaseOffset) * profile.wobbleAmplitude;
      const turnRateRad = (profile.turnRate * Math.PI) / 180; // Convert to rad/sec
      currentHeading += turnRateRad * dt * (1 + wobble * 10);
      currentHeading = currentHeading % (Math.PI * 2); // Wrap to 0-2π

      // Convert heading to radians for calculations
      const headingRad = currentHeading;

      // Calculate movement based on speed and heading
      const speedMs = profile.speed; // m/s
      const earthRadius = 6371000; // meters
      const distance = speedMs * dt; // meters

      // Convert distance to lat/lng delta
      const latDelta = (distance / earthRadius) * (180 / Math.PI);
      const lngDelta =
        ((distance / earthRadius) * (180 / Math.PI)) / Math.cos((profile.baseLat * Math.PI) / 180);

      // Apply movement
      const lastPoint = history.length > 0 ? history[history.length - 1] : null;
      const baseLat = lastPoint?.lat ?? runtime.position.lat;
      const baseLng = lastPoint?.lng ?? runtime.position.lng;

      // Add wobble for more natural movement
      const wobbleLat =
        Math.cos(timeSeconds * 0.15 + profile.phaseOffset) * profile.wobbleAmplitude;
      const wobbleLng =
        Math.sin(timeSeconds * 0.15 + profile.phaseOffset) * profile.wobbleAmplitude;

      newLat = baseLat + Math.cos(headingRad) * latDelta + wobbleLat;
      newLng = baseLng + Math.sin(headingRad) * lngDelta + wobbleLng;
      newSpeed = speedMs;

      // Handle RTL (return to launch)
      if (isReturning) {
        // Use base anchor from runtime state
        const baseAnchor = runtime.baseAnchor;
        // Calculate distance to base using Haversine (more accurate)
        const R = 6371000; // Earth radius in meters
        const dLat = ((baseAnchor.lat - newLat) * Math.PI) / 180;
        const dLng = ((baseAnchor.lng - newLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((newLat * Math.PI) / 180) *
            Math.cos((baseAnchor.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceToBase = R * c; // meters

        if (distanceToBase > 10) {
          // Still returning - navigate toward base
          const lat1Rad = (newLat * Math.PI) / 180;
          const lat2Rad = (baseAnchor.lat * Math.PI) / 180;
          const dLngRad = ((baseAnchor.lng - newLng) * Math.PI) / 180;

          const y = Math.sin(dLngRad) * Math.cos(lat2Rad);
          const x =
            Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLngRad);
          const returnHeading = Math.atan2(y, x);

          const returnSpeed = 8; // m/s return speed (slower than mission)
          const distance = returnSpeed * dt;
          const latDelta = (distance / R) * (180 / Math.PI);
          const lngDelta = ((distance / R) * (180 / Math.PI)) / Math.cos(lat1Rad);

          newLat = newLat + Math.cos(returnHeading) * latDelta;
          newLng = newLng + Math.sin(returnHeading) * lngDelta;
          newSpeed = returnSpeed;
          currentHeading = returnHeading;
        } else {
          // Reached base (<=10m), auto LAND
          newLat = baseAnchor.lat;
          newLng = baseAnchor.lng;
          newSpeed = 0;
          newAlt = 0;
          finalStatus = "online";
          // Clear returning flag and activeMissionId if still set
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { updateRuntimeState: updateRuntime } = require("../lib/stores/drone-store");
          updateRuntime(drone.id, {
            status: "online",
            activeMissionId: null,
            updatedAt: new Date().toISOString(),
          });
          updatedActiveMissionId = null;
        }
      }

      // Handle altitude based on status and commands
      // Get current altitude from runtime state
      const currentAlt = runtime.position.alt;

      if (targetAltitude !== null && targetAltitude !== undefined) {
        // Commanded altitude (TAKEOFF or LAND)
        const altDiff = targetAltitude - currentAlt;
        const altChangeRate = 2; // m/s vertical speed

        if (Math.abs(altDiff) > 1) {
          newAlt =
            currentAlt + Math.sign(altDiff) * Math.min(Math.abs(altDiff), altChangeRate * dt);
        } else {
          newAlt = targetAltitude;
        }
      } else if (effectiveStatus === "in-mission") {
        // In-mission: maintain altitude with variation
        const baseAlt = 50 + (profile.random?.() ?? Math.random()) * 50; // 50-100m
        newAlt = baseAlt + Math.sin(timeSeconds * 0.2) * 10; // ±10m variation
      } else {
        // Online: lower altitude
        newAlt = 20 + Math.sin(timeSeconds * 0.1) * 5; // 15-25m
      }

      // Update motion state
      if (updateMotionState) {
        updateMotionState(drone.id, currentHeading, now);
      }
    } else {
      // Stationary drones
      newSpeed = 0;
      newAlt = 0;
      // Keep last position
      const lastPoint = history.length > 0 ? history[history.length - 1] : null;
      if (lastPoint) {
        newLat = lastPoint.lat;
        newLng = lastPoint.lng;
      } else {
        newLat = runtime.position.lat;
        newLng = runtime.position.lng;
      }
    }

    // Update position history (keep last 30 points for trails)
    history.push({ lat: newLat, lng: newLng, timestamp: now });
    if (history.length > 30) {
      history.shift();
    }
    positionHistory.set(drone.id, history);

    // Simulate battery drain based on status
    let batteryChange = 0;
    if (effectiveStatus === "in-mission") {
      batteryChange = -0.05; // Faster drain in mission
    } else if (effectiveStatus === "online") {
      batteryChange = -0.01; // Slow drain when online
    } else if (effectiveStatus === "charging") {
      batteryChange = 0.5; // Charging
    }

    const newBatteryPct = Math.max(0, Math.min(100, runtime.batteryPct + batteryChange));

    // Update runtime state in canonical store
    updateRuntimeState(drone.id, {
      position: { lat: newLat, lng: newLng, alt: newAlt, speed: newSpeed },
      batteryPct: newBatteryPct,
      status: finalStatus,
      activeMissionId: updatedActiveMissionId,
      updatedAt: new Date().toISOString(),
    });

    // Clamp GPS quality to valid range [0, 100]
    const baseGpsQuality = drone.health.gpsQuality;
    const gpsVariation = (Math.random() - 0.5) * 2; // -1 to +1
    const gpsQuality = Math.max(0, Math.min(100, baseGpsQuality + gpsVariation));

    // Include mission fields for transition detection (when scope=map)
    const telemetryEntry: Telemetry = {
      droneId: drone.id,
      timestamp: new Date().toISOString(),
      position: {
        lat: newLat,
        lng: newLng,
        alt: newAlt,
        speed: newSpeed,
      },
      batteryPct: newBatteryPct,
      gpsQuality,
      speed: Math.max(0, newSpeed), // Ensure speed is non-negative
      altitude: Math.max(0, newAlt), // Ensure altitude is non-negative
    };

    // Add mission fields if active mission exists
    if (activeMission) {
      telemetryEntry.activeMissionId = activeMission.id;
      telemetryEntry.activeMissionStatus = activeMission.status;
    } else if (updatedActiveMissionId === null && activeMissionId !== null) {
      // Mission was cleared - include null to signal transition
      telemetryEntry.activeMissionId = null;
    }

    return telemetryEntry;
  });
}

// Get flight trail for a drone
export function getFlightTrail(droneId: string): Array<{ lat: number; lng: number }> {
  const history = positionHistory.get(droneId) || [];
  return history.map((p) => ({ lat: p.lat, lng: p.lng }));
}

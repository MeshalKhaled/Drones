import type { Drone } from "@/lib/domain/types";

// Hash function to derive stable seed from droneId
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Per-drone motion profile
interface MotionProfile {
  baseLat: number;
  baseLng: number;
  speed: number; // m/s, range 2-12
  heading: number; // degrees, 0-360
  turnRate: number; // deg/sec, range 5-25
  wobbleAmplitude: number; // small, range 0.0002-0.001
  phaseOffset: number; // unique phase
  random: () => number; // seeded RNG
}

// Motion state per drone (persists across requests)
const motionProfiles = new Map<string, MotionProfile>();
const motionState = new Map<string, { heading: number; lastUpdate: number }>();

// Initialize motion profile for a drone (deterministic based on droneId)
function initializeMotionProfile(drone: Drone): MotionProfile {
  const seed = hashString(drone.id);
  const random = seededRandom(seed);

  // Derive unique parameters from seed
  const speed = 2 + random() * 10; // 2-12 m/s
  const heading = random() * 360; // 0-360 degrees
  const turnRate = 5 + random() * 20; // 5-25 deg/sec
  const wobbleAmplitude = 0.0002 + random() * 0.0008; // 0.0002-0.001
  const phaseOffset = random() * Math.PI * 2; // 0-2π

  return {
    baseLat: drone.position.lat,
    baseLng: drone.position.lng,
    speed,
    heading,
    turnRate,
    wobbleAmplitude,
    phaseOffset,
    random,
  };
}

// Get or create motion profile for a drone
export function getMotionProfile(drone: Drone): MotionProfile {
  if (!motionProfiles.has(drone.id)) {
    motionProfiles.set(drone.id, initializeMotionProfile(drone));
  }
  return motionProfiles.get(drone.id)!;
}

// Get current motion state
export function getMotionState(droneId: string): { heading: number; lastUpdate: number } | null {
  return motionState.get(droneId) || null;
}

// Update motion state
export function updateMotionState(droneId: string, heading: number, timestamp: number): void {
  motionState.set(droneId, { heading, lastUpdate: timestamp });
}

// Reset motion state (for RTL or landing)
export function resetMotionState(droneId: string): void {
  motionState.delete(droneId);
}

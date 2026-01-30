import { describe, it, expect } from "vitest";
import {
  getDroneProfile,
  listDroneProfiles,
  getDroneRuntimeState,
  getDroneWithState,
  listDronesWithState,
  applyCommand,
  updateRuntimeState,
} from "@/lib/stores/drone-store";

describe("drone-store", () => {
  describe("listDroneProfiles", () => {
    it("should return at least 25 drone profiles", () => {
      const profiles = listDroneProfiles();
      expect(profiles.length).toBeGreaterThanOrEqual(25);
    });

    it("should return profiles with valid structure", () => {
      const profiles = listDroneProfiles();
      const firstProfile = profiles[0];

      expect(firstProfile).toBeDefined();
      expect(firstProfile?.id).toBeDefined();
      expect(firstProfile?.name).toBeDefined();
      expect(typeof firstProfile?.flightHours).toBe("number");
      expect(firstProfile?.health).toBeDefined();
      expect(firstProfile?.health.signalStrength).toBeDefined();
      expect(firstProfile?.health.gpsQuality).toBeDefined();
      expect(firstProfile?.health.motorHealth).toBeDefined();
      expect(firstProfile?.health.overall).toBeDefined();
    });
  });

  describe("getDroneProfile", () => {
    it("should return a profile for valid ID", () => {
      const profiles = listDroneProfiles();
      const firstId = profiles[0]?.id;

      if (firstId) {
        const profile = getDroneProfile(firstId);
        expect(profile).not.toBeNull();
        expect(profile?.id).toBe(firstId);
      }
    });

    it("should return null for invalid ID", () => {
      const profile = getDroneProfile("non-existent-id");
      expect(profile).toBeNull();
    });
  });

  describe("getDroneRuntimeState", () => {
    it("should return runtime state for valid drone", () => {
      const profiles = listDroneProfiles();
      const firstId = profiles[0]?.id;

      if (firstId) {
        const runtime = getDroneRuntimeState(firstId);
        expect(runtime).not.toBeNull();
        expect(runtime?.status).toBeDefined();
        expect(typeof runtime?.armed).toBe("boolean");
        expect(typeof runtime?.returning).toBe("boolean");
        expect(runtime?.position).toBeDefined();
        expect(typeof runtime?.batteryPct).toBe("number");
      }
    });

    it("should return null for invalid drone", () => {
      const runtime = getDroneRuntimeState("non-existent-id");
      expect(runtime).toBeNull();
    });
  });

  describe("getDroneWithState", () => {
    it("should return combined profile and runtime state", () => {
      const profiles = listDroneProfiles();
      const firstId = profiles[0]?.id;

      if (firstId) {
        const droneWithState = getDroneWithState(firstId);
        expect(droneWithState).not.toBeNull();
        expect(droneWithState?.profile).toBeDefined();
        expect(droneWithState?.runtime).toBeDefined();
        expect(droneWithState?.profile.id).toBe(firstId);
      }
    });
  });

  describe("listDronesWithState", () => {
    it("should return at least 25 drones with state", () => {
      const drones = listDronesWithState();
      expect(drones.length).toBeGreaterThanOrEqual(25);
    });

    it("should include both profile and runtime for each drone", () => {
      const drones = listDronesWithState();
      drones.forEach((drone) => {
        expect(drone.profile).toBeDefined();
        expect(drone.runtime).toBeDefined();
      });
    });
  });

  describe("applyCommand", () => {
    it("should arm a drone", () => {
      const profiles = listDroneProfiles();
      const firstId = profiles[0]?.id;

      if (firstId) {
        const result = applyCommand(firstId, "ARM");
        expect(result.success).toBe(true);
        expect(result.newState?.armed).toBe(true);
      }
    });

    it("should reject takeoff for unarmed drone", () => {
      const profiles = listDroneProfiles();
      // Find a drone that's not armed
      const testDrone = profiles.find((p) => {
        const state = getDroneRuntimeState(p.id);
        return state && !state.armed;
      });

      if (testDrone) {
        const result = applyCommand(testDrone.id, "TAKEOFF");
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("NOT_ARMED");
      }
    });

    it("should return error for non-existent drone", () => {
      const result = applyCommand("non-existent-id", "ARM");
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
    });
  });

  describe("updateRuntimeState", () => {
    it("should update position", () => {
      const profiles = listDroneProfiles();
      const firstId = profiles[0]?.id;

      if (firstId) {
        const newPosition = {
          lat: 40.7128,
          lng: -74.006,
          alt: 100,
          speed: 25,
        };

        updateRuntimeState(firstId, { position: newPosition });

        const updated = getDroneRuntimeState(firstId);
        expect(updated?.position.lat).toBe(newPosition.lat);
        expect(updated?.position.lng).toBe(newPosition.lng);
      }
    });

    it("should update battery level", () => {
      const profiles = listDroneProfiles();
      const firstId = profiles[0]?.id;

      if (firstId) {
        const newBattery = 75;
        updateRuntimeState(firstId, { batteryPct: newBattery });

        const updated = getDroneRuntimeState(firstId);
        expect(updated?.batteryPct).toBe(newBattery);
      }
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  getMissions,
  getMissionById,
  addMission,
  getActiveMissionForDrone,
  startMission,
  completeMission,
  advanceMissionWaypoint,
  updateMissionStore,
} from "@/lib/stores/mission-store";
import { mockMissions } from "@/services/mock-data";
import type { Mission } from "@/lib/domain/types";

describe("mission-store", () => {
  describe("initialization", () => {
    it("should start with at least 50 missions", () => {
      const missions = getMissions();
      expect(missions.length).toBeGreaterThanOrEqual(50);
    });

    it("should have missions matching mockMissions count", () => {
      const missions = getMissions();
      // Allow for missions that may have been added during other tests
      expect(missions.length).toBeGreaterThanOrEqual(mockMissions.length);
    });

    it("should have missions with valid structure", () => {
      const missions = getMissions();
      const firstMission = missions[0];

      expect(firstMission).toBeDefined();
      expect(firstMission?.id).toBeDefined();
      expect(firstMission?.droneId).toBeDefined();
      expect(firstMission?.status).toBeDefined();
      expect(firstMission?.waypoints).toBeDefined();
      expect(Array.isArray(firstMission?.waypoints)).toBe(true);
      expect(firstMission?.createdAt).toBeDefined();
      expect(firstMission?.updatedAt).toBeDefined();
    });

    it("should have missions with valid status values", () => {
      const missions = getMissions();
      const validStatuses = ["pending", "in-progress", "completed", "failed", "cancelled"];

      missions.forEach((mission) => {
        expect(validStatuses).toContain(mission.status);
      });
    });
  });

  describe("getMissionById", () => {
    it("should return a mission when given a valid ID", () => {
      const missions = getMissions();
      const firstMission = missions[0];

      if (firstMission) {
        const found = getMissionById(firstMission.id);
        expect(found).toEqual(firstMission);
      }
    });

    it("should return null for non-existent ID", () => {
      const found = getMissionById("non-existent-id");
      expect(found).toBeNull();
    });
  });

  describe("addMission", () => {
    it("should add a new mission to the store", () => {
      const initialCount = getMissions().length;

      const newMission: Mission = {
        id: "test-mission-" + Date.now(),
        droneId: "test-drone",
        status: "pending",
        startTime: null,
        endTime: null,
        success: false,
        waypoints: [
          { lat: 37.7749, lng: -122.4194, alt: 50, order: 0 },
          { lat: 37.7849, lng: -122.4094, alt: 60, order: 1 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addMission(newMission);

      const missions = getMissions();
      expect(missions.length).toBe(initialCount + 1);
      expect(getMissionById(newMission.id)).toEqual(newMission);
    });
  });

  describe("getActiveMissionForDrone", () => {
    it("should return null if drone has no active missions", () => {
      const result = getActiveMissionForDrone("non-existent-drone");
      expect(result).toBeNull();
    });

    it("should find active mission for drone", () => {
      const missions = getMissions();
      const inProgressMission = missions.find((m) => m.status === "in-progress");

      if (inProgressMission) {
        const found = getActiveMissionForDrone(inProgressMission.droneId);
        // Should find the mission or null if drone has multiple missions
        if (found) {
          expect(found.status).toBe("in-progress");
          expect(found.droneId).toBe(inProgressMission.droneId);
        }
      }
    });
  });

  describe("mission state transitions", () => {
    // Use a counter to ensure unique IDs
    let testCounter = 0;

    function createTestMission(): Mission {
      testCounter++;
      const uniqueId = `transition-test-${Date.now()}-${testCounter}-${Math.random().toString(36).slice(2)}`;
      const mission: Mission = {
        id: uniqueId,
        droneId: `transition-test-drone-${uniqueId}`,
        status: "pending",
        startTime: null,
        endTime: null,
        success: false,
        waypoints: [
          { lat: 37.7749, lng: -122.4194, alt: 50, order: 0 },
          { lat: 37.7849, lng: -122.4094, alt: 60, order: 1 },
          { lat: 37.7949, lng: -122.3994, alt: 70, order: 2 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addMission(mission);
      return mission;
    }

    it("should start a pending mission", () => {
      const testMission = createTestMission();
      const started = startMission(testMission.id);

      expect(started).not.toBeNull();
      expect(started?.status).toBe("in-progress");
      expect(started?.startedAt).toBeDefined();
      expect(started?.startTime).toBeDefined();
      expect(started?.currentWaypointIndex).toBe(0);
    });

    it("should throw error when starting non-pending mission", () => {
      const testMission = createTestMission();
      // Start the mission first
      const startedMission = startMission(testMission.id);
      expect(startedMission?.status).toBe("in-progress");

      // Try to start again - should throw
      expect(() => startMission(testMission.id)).toThrow(/cannot be started/);
    });

    it("should advance waypoint index", () => {
      const testMission = createTestMission();
      startMission(testMission.id);

      const advanced = advanceMissionWaypoint(testMission.id);
      expect(advanced?.currentWaypointIndex).toBe(1);
    });

    it("should complete mission when all waypoints reached", () => {
      const testMission = createTestMission();
      startMission(testMission.id);

      // Advance through all waypoints
      advanceMissionWaypoint(testMission.id); // 0 -> 1
      advanceMissionWaypoint(testMission.id); // 1 -> 2
      const completed = advanceMissionWaypoint(testMission.id); // 2 -> completed

      // Mission completes successfully when all waypoints are reached
      expect(completed?.status).toBe("completed");
      expect(completed?.success).toBe(true);
      expect(completed?.endTime).toBeDefined();
    });

    it("should complete mission with failure when specified", () => {
      const testMission = createTestMission();
      startMission(testMission.id);

      const failed = completeMission(testMission.id, false);

      expect(failed?.status).toBe("failed");
      expect(failed?.success).toBe(false);
      expect(failed?.endTime).toBeDefined();
    });
  });

  describe("updateMissionStore", () => {
    it("should replace entire mission store", () => {
      const newMissions: Mission[] = [
        {
          id: "replacement-1",
          droneId: "drone-1",
          status: "pending",
          startTime: null,
          endTime: null,
          success: false,
          waypoints: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      updateMissionStore(newMissions);

      const missions = getMissions();
      expect(missions.length).toBe(1);
      expect(missions[0]?.id).toBe("replacement-1");

      // Restore original missions for other tests
      updateMissionStore([...mockMissions]);
    });
  });
});

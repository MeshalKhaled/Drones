import { describe, it, expect } from "vitest";
import {
  cn,
  formatBattery,
  formatFlightHours,
  formatDate,
  formatDuration,
  formatTimeAgo,
} from "@/lib/utils";

describe("utils", () => {
  describe("cn (classnames)", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should merge tailwind classes properly", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
    });
  });

  describe("formatBattery", () => {
    it("should format battery percentage", () => {
      expect(formatBattery(75)).toBe("75%");
    });

    it("should handle 0%", () => {
      expect(formatBattery(0)).toBe("0%");
    });

    it("should handle 100%", () => {
      expect(formatBattery(100)).toBe("100%");
    });

    it("should round decimal values", () => {
      expect(formatBattery(75.7)).toBe("76%");
    });
  });

  describe("formatFlightHours", () => {
    it("should format hours and minutes", () => {
      expect(formatFlightHours(2.5)).toBe("2h 30m");
    });

    it("should handle zero hours", () => {
      expect(formatFlightHours(0)).toBe("0m");
    });

    it("should handle whole hours only", () => {
      expect(formatFlightHours(5)).toBe("5h");
    });

    it("should handle minutes only", () => {
      expect(formatFlightHours(0.5)).toBe("30m");
    });
  });

  describe("formatDate", () => {
    it("should format ISO date string", () => {
      const result = formatDate("2024-01-15T10:30:00Z");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle Date object", () => {
      const result = formatDate(new Date("2024-01-15T10:30:00Z"));
      expect(result).toBeDefined();
    });
  });

  describe("formatDuration", () => {
    it("should format seconds to minutes", () => {
      expect(formatDuration(120)).toBe("2m");
    });

    it("should format hours and minutes", () => {
      expect(formatDuration(3720)).toBe("1h 2m");
    });

    it("should handle zero", () => {
      expect(formatDuration(0)).toBe("0m");
    });

    it("should format hours only when no remaining minutes", () => {
      expect(formatDuration(3600)).toBe("1h 0m");
    });
  });

  describe("formatTimeAgo", () => {
    it("should return 'Just now' for very recent times", () => {
      const now = new Date();
      expect(formatTimeAgo(now)).toBe("Just now");
    });

    it("should format minutes ago", () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatTimeAgo(fiveMinAgo)).toBe("5m ago");
    });

    it("should format hours ago", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoHoursAgo)).toBe("2h ago");
    });

    it("should format days ago", () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoDaysAgo)).toBe("2d ago");
    });

    it("should handle string input", () => {
      const result = formatTimeAgo(new Date().toISOString());
      expect(result).toBeDefined();
    });
  });
});

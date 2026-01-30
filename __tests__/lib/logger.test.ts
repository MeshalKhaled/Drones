import { describe, it, expect, vi } from "vitest";
import { logger, inDevelopment } from "@/lib/logger";

describe("logger", () => {
  describe("logger object", () => {
    it("should have all logging methods", () => {
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.log).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should not throw when calling log methods", () => {
      expect(() => logger.debug("test")).not.toThrow();
      expect(() => logger.info("test")).not.toThrow();
      expect(() => logger.log("test")).not.toThrow();
      expect(() => logger.warn("test")).not.toThrow();
      expect(() => logger.error("test")).not.toThrow();
    });

    it("should accept multiple arguments", () => {
      expect(() => logger.error("error", { detail: "test" }, 123)).not.toThrow();
    });
  });

  describe("inDevelopment helper", () => {
    it("should be a function", () => {
      expect(typeof inDevelopment).toBe("function");
    });

    it("should accept a callback function", () => {
      const callback = vi.fn();
      expect(() => inDevelopment(callback)).not.toThrow();
    });
  });
});

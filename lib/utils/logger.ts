/**
 * Production-safe logger utility
 *
 * Only outputs logs in development mode.
 * In production, logs are silently discarded to avoid exposing
 * sensitive information or cluttering the console.
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info("Some message");
 *   logger.error("Error occurred:", error);
 *   logger.debug("Debug info:", data);
 */

const isDevelopment = process.env.NODE_ENV === "development";

type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

function createLogger(): Logger {
  const noop = () => {
    // No-op in production
  };

  if (!isDevelopment) {
    return {
      debug: noop,
      info: noop,
      log: noop,
      warn: noop,
      error: noop,
    };
  }

  // In development, use console with timestamp prefix
  const formatArgs = (level: LogLevel, args: unknown[]): unknown[] => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return [prefix, ...args];
  };

  return {
    debug: (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.debug(...formatArgs("debug", args));
    },
    info: (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.info(...formatArgs("info", args));
    },
    log: (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.log(...formatArgs("info", args));
    },
    warn: (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.warn(...formatArgs("warn", args));
    },
    error: (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.error(...formatArgs("error", args));
    },
  };
}

export const logger = createLogger();

/**
 * Guard for conditional logging based on environment
 * Use this when you need to wrap more complex logging logic
 */
export function inDevelopment(fn: () => void): void {
  if (isDevelopment) {
    fn();
  }
}

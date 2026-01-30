/**
 * Barrel file for all utilities
 * Re-export all utilities for convenient importing
 */

// Core formatting utilities
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatBattery(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    const mins = diffMins % 60;
    return mins > 0 ? `${diffHours}h ${mins}m ago` : `${diffHours}h ago`;
  } else {
    const hours = diffHours % 24;
    return hours > 0 ? `${diffDays}d ${hours}h ago` : `${diffDays}d ago`;
  }
}

export function formatFlightHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.floor((hours - wholeHours) * 60);
  if (wholeHours > 0) {
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }
  return `${minutes}m`;
}

// Re-export from subdirectories
export * from "./logger";
export * from "./theme";
export * from "./mission-reasons";
// Analytics moved to domain - import directly from @/lib/domain/analytics

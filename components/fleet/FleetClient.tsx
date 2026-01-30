"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useUIStore } from "@/lib/stores/ui/ui-store";
import { useFleetUIStore } from "@/lib/stores/ui/fleetUiStore";
import { apiGet } from "@/lib/api";
import { ApiResponseSchema } from "@/lib/domain/types";
import { DroneSchema, type Drone, type DroneStatus } from "@/lib/domain/types";
import { DroneCard } from "./DroneCard";
import { DroneMetricsTable } from "./DroneMetricsTable";
import { Circle, Rocket, Battery, AlertCircle, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetClientProps {
  initialDrones: Drone[];
  initialCounts: {
    online: number;
    "in-mission": number;
    charging: number;
    offline: number;
  };
}

const statusIcons: Record<DroneStatus, typeof Circle> = {
  online: Circle,
  "in-mission": Rocket,
  charging: Battery,
  offline: AlertCircle,
};

const statusColors: Record<DroneStatus, string> = {
  online: "text-green-500",
  "in-mission": "text-orange-500",
  charging: "text-blue-400",
  offline: "text-red-500",
};

const statusDotColors: Record<DroneStatus, string> = {
  online: "bg-green-500",
  "in-mission": "bg-orange-500",
  charging: "bg-blue-500",
  offline: "bg-red-500",
};

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "batteryPct", label: "Battery" },
  { value: "updatedAt", label: "Last Updated" },
] as const;

export function FleetClient({ initialDrones, initialCounts }: FleetClientProps) {
  const { searchQuery } = useUIStore();
  const {
    viewMode,
    filtersPanelOpen,
    selectedStatuses,
    sort,
    setFiltersPanelOpen,
    toggleStatusFilter,
    clearStatusFilters,
    setSort,
  } = useFleetUIStore();

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, string | undefined> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedStatuses.length === 1) params.status = selectedStatuses[0];
    if (sort) params.sort = sort;
    return params;
  }, [debouncedSearch, selectedStatuses, sort]);

  // Fetch drones with React Query
  const {
    data: dronesResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["drones", queryParams],
    queryFn: () => apiGet("/api/drones", ApiResponseSchema(DroneSchema.array()), queryParams),
    placeholderData: keepPreviousData,
    refetchInterval: 5000, // Poll every 5 seconds
    initialData: {
      data: initialDrones,
      meta: { total: initialDrones.length },
    },
  });

  const drones = useMemo(() => dronesResponse?.data ?? [], [dronesResponse?.data]);

  const counts = useMemo(() => {
    if (drones.length === 0) return initialCounts;
    return {
      online: drones.filter((d) => d.status === "online").length,
      "in-mission": drones.filter((d) => d.status === "in-mission").length,
      charging: drones.filter((d) => d.status === "charging").length,
      offline: drones.filter((d) => d.status === "offline").length,
    };
  }, [drones, initialCounts]);

  // R-100: Track offline count changes for ARIA live announcements
  const prevOfflineCount = useRef(counts.offline);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>("");

  useEffect(() => {
    if (counts.offline > prevOfflineCount.current) {
      const newOffline = counts.offline - prevOfflineCount.current;
      setStatusAnnouncement(
        `Alert: ${newOffline} drone${newOffline > 1 ? "s have" : " has"} gone offline. Total offline: ${counts.offline}`
      );
    } else if (counts.offline < prevOfflineCount.current) {
      const recovered = prevOfflineCount.current - counts.offline;
      setStatusAnnouncement(
        `${recovered} drone${recovered > 1 ? "s" : ""} back online. Total offline: ${counts.offline}`
      );
    }
    prevOfflineCount.current = counts.offline;
  }, [counts.offline]);

  // Filter drones by multiple statuses if selected
  const filteredDrones = useMemo(() => {
    if (selectedStatuses.length === 0 || selectedStatuses.length === 1) {
      return drones;
    }
    return drones.filter((drone) => selectedStatuses.includes(drone.status));
  }, [drones, selectedStatuses]);

  return (
    <div className="space-y-6">
      {/* R-100: ARIA live region for status change announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {statusAnnouncement}
      </div>

      {/* Status Summary Chips */}
      <div
        className="flex flex-wrap items-center gap-3"
        role="group"
        aria-label="Filter drones by status"
      >
        {(Object.entries(counts) as [DroneStatus, number][]).map(([status, count]) => {
          const isSelected = selectedStatuses.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatusFilter(status)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-4 py-2 shadow-sm transition-all",
                isSelected
                  ? "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
              )}
              aria-pressed={isSelected}
              aria-label={`Filter by ${status} (${count} drones)`}
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", statusDotColors[status])} />
              <span className="text-sm font-medium capitalize">{status.replace("-", " ")}</span>
              <span className="ml-1 text-sm opacity-50">{count}</span>
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-all",
              "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            )}
            aria-expanded={filtersPanelOpen}
            aria-label="Toggle filters panel"
          >
            <Filter size={14} aria-hidden="true" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <select
              value={sort || ""}
              onChange={(e) => setSort((e.target.value as typeof sort) || null)}
              className="cursor-pointer appearance-none rounded-md border border-zinc-200 bg-white px-3 py-1.5 pr-8 text-sm text-zinc-700 hover:bg-zinc-50 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Sort drones"
            >
              <option value="">Sort By:</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 transform text-zinc-400 dark:text-zinc-500"
              size={14}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersPanelOpen && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Filter by Status</h3>
            {selectedStatuses.length > 0 && (
              <button
                type="button"
                onClick={clearStatusFilters}
                className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusIcons) as DroneStatus[]).map((status) => {
              const StatusIcon = statusIcons[status];
              const isSelected = selectedStatuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatusFilter(status)}
                  className={cn(
                    "flex items-center gap-2 rounded border px-3 py-1.5 text-sm transition-all",
                    isSelected
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  )}
                  aria-pressed={isSelected}
                >
                  <StatusIcon className={cn("h-3 w-3", statusColors[status])} aria-hidden="true" />
                  <span className="capitalize">{status.replace("-", " ")}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Drone Grid/List */}
      {filteredDrones.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No drones found matching your filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDrones.map((drone) => (
            <DroneCard key={drone.id} drone={drone} />
          ))}
        </div>
      ) : (
        <DroneMetricsTable drones={filteredDrones} />
      )}

      {/* Loading/Error Status Bar */}
      <div className="sticky bottom-0 left-0 right-0 -mx-4 mt-6 border-t border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900 lg:-mx-6">
        <div className="flex items-center justify-between text-sm">
          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <div
                className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent dark:border-zinc-500"
                aria-hidden="true"
              />
              <span>Loading data...</span>
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle size={14} aria-hidden="true" />
              <span>Error: Failed to fetch data.</span>
            </div>
          )}
          {!isLoading && !isError && (
            <div className="text-zinc-500 opacity-50 dark:text-zinc-400">
              {filteredDrones.length} drone{filteredDrones.length !== 1 ? "s" : ""} displayed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

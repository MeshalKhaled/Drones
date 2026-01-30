"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import type { MissionStatus } from "@/lib/domain/types";

const STATUS_OPTIONS: Array<{ value: MissionStatus | "all"; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS: Array<{ value: "startDate" | "status" | "createdAt"; label: string }> = [
  { value: "createdAt", label: "Created Date" },
  { value: "startDate", label: "Start Date" },
  { value: "status", label: "Status" },
];

export function MissionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = (searchParams.get("status") as MissionStatus | null) || "all";
  const currentSort =
    (searchParams.get("sort") as "startDate" | "status" | "createdAt") || "createdAt";

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`/missions?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    updateParams({ search: value || null });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === "all" ? null : value });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400 dark:text-zinc-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Search missions..."
          value={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-10 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <Filter
          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400 dark:text-zinc-500"
          size={18}
        />
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="cursor-pointer appearance-none rounded-md border border-zinc-200 bg-white py-2 pl-10 pr-8 text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="relative">
        <ArrowUpDown
          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400 dark:text-zinc-500"
          size={18}
        />
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="cursor-pointer appearance-none rounded-md border border-zinc-200 bg-white py-2 pl-10 pr-8 text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

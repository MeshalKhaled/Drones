import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getMissions } from "@/lib/stores/mission-store";
import type { Mission, MissionStatus } from "@/lib/domain/types";
import { MissionFilters } from "@/components/mission/MissionFilters";
import { MissionsTable } from "@/components/mission/MissionsTable";

interface MissionsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getMissionsData(params: {
  search?: string;
  status?: string;
  sort?: string;
  page?: string;
}): Promise<{
  missions: Mission[];
  total: number;
  page: number;
  totalPages: number;
}> {
  noStore(); // Ensure fresh data on every request

  const allMissions = getMissions();
  const currentPage = parseInt(params.page || "1", 10);
  const pageSize = 20;

  // Filter missions
  let filtered = [...allMissions];

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (mission) =>
        mission.id.toLowerCase().includes(searchLower) ||
        mission.droneId.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (params.status && params.status !== "all") {
    filtered = filtered.filter((mission) => mission.status === (params.status as MissionStatus));
  }

  // Apply sorting
  if (params.sort) {
    filtered.sort((a, b) => {
      switch (params.sort) {
        case "startDate":
          const aStart = a.startTime ? new Date(a.startTime).getTime() : 0;
          const bStart = b.startTime ? new Date(b.startTime).getTime() : 0;
          return bStart - aStart;
        case "status":
          return a.status.localeCompare(b.status);
        case "createdAt":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  } else {
    // Default: sort by createdAt (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Apply pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  return {
    missions: paginated,
    total,
    page: currentPage,
    totalPages,
  };
}

async function MissionsContent({ searchParams }: MissionsPageProps) {
  const params = await searchParams;
  const { missions, total, page, totalPages } = await getMissionsData(params);

  // Convert params to record for MissionsTable
  const searchParamsRecord: Record<string, string> = {};
  if (params.search) searchParamsRecord.search = params.search;
  if (params.status) searchParamsRecord.status = params.status;
  if (params.sort) searchParamsRecord.sort = params.sort;

  return (
    <>
      <MissionFilters />
      <MissionsTable
        missions={missions}
        currentPage={page}
        totalPages={totalPages}
        total={total}
        searchParams={searchParamsRecord}
      />
    </>
  );
}

export default async function MissionsPage({ searchParams }: MissionsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Missions</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            View and manage all missions
          </p>
        </div>
        <Link
          href="/missions/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          <Plus size={18} />
          New Mission
        </Link>
      </div>

      {/* Filters and Table */}
      <Suspense
        fallback={
          <>
            <div className="flex animate-pulse flex-col gap-4 sm:flex-row">
              <div className="h-10 flex-1 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-10 w-40 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-10 w-40 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="animate-pulse rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 rounded bg-zinc-100 dark:bg-zinc-800" />
                ))}
              </div>
            </div>
          </>
        }
      >
        <MissionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

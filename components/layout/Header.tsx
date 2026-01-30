"use client";

import { Search } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui/ui-store";
import { usePathname } from "next/navigation";
import { ThemeToggleCompact } from "./ThemeToggle";
import { PresenceIndicator } from "@/components/ui/PresenceIndicator";

const pageTitles: Record<string, string> = {
  "/fleet": "Fleet Overview",
  "/map": "Live Map",
  "/missions/new": "New Mission",
  "/analytics": "Analytics",
};

export function Header() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useUIStore();

  const pageTitle =
    Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname.startsWith(path + "/")
    )?.[1] || "Dashboard";

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:px-6"
      style={{
        top: "env(safe-area-inset-top, 0px)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        height: "calc(4rem + env(safe-area-inset-top, 0px))",
      }}
    >
      <h1 className="ml-14 text-xl font-medium text-zinc-900 dark:text-zinc-100 lg:ml-0">
        {pageTitle}
      </h1>

      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-zinc-400 dark:text-zinc-500"
            size={16}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search drones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-10 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            aria-label="Search drones"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PresenceIndicator />
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
        <ThemeToggleCompact />
      </div>
    </header>
  );
}

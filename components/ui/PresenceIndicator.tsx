"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePresenceStore, selectOtherUsers, selectCurrentUser } from "@/lib/stores/ui/presenceStore";
import { cn } from "@/lib/utils";

interface PresenceAvatarProps {
  name: string;
  avatar: string;
  color: string;
  isOnline?: boolean;
  size?: "sm" | "md";
}

function PresenceAvatar({
  name,
  avatar,
  color,
  isOnline = true,
  size = "md",
}: PresenceAvatarProps) {
  const sizeClasses = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-medium text-white ring-2 ring-background",
        sizeClasses
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      {avatar}
      {isOnline && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function PresenceIndicator() {
  const pathname = usePathname();
  const otherUsers = usePresenceStore(selectOtherUsers);
  const setCurrentUser = usePresenceStore((state) => state.setCurrentUser);
  const isConnected = usePresenceStore((state) => state.isConnected);

  // Update current user's page when pathname changes
  useEffect(() => {
    setCurrentUser({ currentPage: pathname });
  }, [pathname, setCurrentUser]);

  // Simulate random page navigation for other users (demo)
  useEffect(() => {
    const pages = ["/fleet", "/map", "/missions", "/analytics"];
    const updateUserPresence = usePresenceStore.getState().updateUserPresence;

    const interval = setInterval(() => {
      const users = usePresenceStore.getState().users;
      const currentUserId = usePresenceStore.getState().currentUserId;

      users.forEach((_user, userId) => {
        if (userId !== currentUserId && Math.random() < 0.1) {
          // 10% chance to move
          const randomPage = pages[Math.floor(Math.random() * pages.length)];
          updateUserPresence(userId, { currentPage: randomPage });
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span>Offline</span>
      </div>
    );
  }

  // Show up to 3 avatars, then +N more
  const visibleUsers = otherUsers.slice(0, 3);
  const remainingCount = otherUsers.length - 3;

  return (
    <div
      className="flex items-center"
      role="group"
      aria-label={`${otherUsers.length} team members online`}
    >
      {/* Stacked avatars */}
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <PresenceAvatar key={user.id} name={user.name} avatar={user.avatar} color={user.color} />
        ))}
        {remainingCount > 0 && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-muted-foreground ring-2 ring-background dark:bg-zinc-800"
            title={`${remainingCount} more users`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Connection status */}
      <div className="ml-3 flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {otherUsers.length + 1} online
        </span>
      </div>
    </div>
  );
}

// Compact version showing just avatars
export function PresenceIndicatorCompact() {
  const otherUsers = usePresenceStore(selectOtherUsers);

  const visibleUsers = otherUsers.slice(0, 2);
  const remainingCount = otherUsers.length - 2;

  return (
    <div className="flex items-center -space-x-1.5" aria-label="Team members online">
      {visibleUsers.map((user) => (
        <PresenceAvatar
          key={user.id}
          name={user.name}
          avatar={user.avatar}
          color={user.color}
          size="sm"
        />
      ))}
      {remainingCount > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-muted-foreground ring-2 ring-background dark:bg-zinc-800">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Full presence list for sidebar or dropdown
export function PresenceList() {
  const pathname = usePathname();
  const otherUsers = usePresenceStore(selectOtherUsers);
  const currentUser = usePresenceStore(selectCurrentUser);

  const pageLabels: Record<string, string> = {
    "/fleet": "Fleet Overview",
    "/map": "Live Map",
    "/missions": "Missions",
    "/missions/new": "New Mission",
    "/analytics": "Analytics",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Team Members
      </h3>
      <ul className="space-y-1" role="list">
        {/* Current user */}
        {currentUser && (
          <li className="flex items-center gap-3 rounded-md bg-zinc-100 p-2 dark:bg-zinc-800">
            <PresenceAvatar name="You" avatar={currentUser.avatar} color={currentUser.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">You</p>
              <p className="truncate text-xs text-muted-foreground">
                {pageLabels[pathname] || pathname}
              </p>
            </div>
          </li>
        )}

        {/* Other users */}
        {otherUsers.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <PresenceAvatar name={user.name} avatar={user.avatar} color={user.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {pageLabels[user.currentPage] || user.currentPage}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

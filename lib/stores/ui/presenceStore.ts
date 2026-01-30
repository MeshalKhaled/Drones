/**
 * Presence store for multi-user collaboration
 *
 * In a production app, this would be backed by a real-time service
 * like Ably, Pusher, Liveblocks, or WebSocket server.
 *
 * For demo purposes, this simulates other users viewing the dashboard.
 */

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  currentPage: string;
  lastSeen: string;
  cursor?: {
    x: number;
    y: number;
  };
}

interface PresenceState {
  currentUserId: string;
  users: Map<string, User>;
  isConnected: boolean;

  // Actions
  setCurrentUser: (user: Partial<User>) => void;
  updateUserPresence: (userId: string, updates: Partial<User>) => void;
  removeUser: (userId: string) => void;
  setConnected: (connected: boolean) => void;
}

// Generate a unique user ID for this session
const sessionUserId = uuidv4();

// Simulated other users for demo
const SIMULATED_USERS: User[] = [
  {
    id: "user-alice",
    name: "Alice Chen",
    avatar: "AC",
    color: "#f472b6", // pink
    currentPage: "/fleet",
    lastSeen: new Date().toISOString(),
  },
  {
    id: "user-bob",
    name: "Bob Smith",
    avatar: "BS",
    color: "#60a5fa", // blue
    currentPage: "/map",
    lastSeen: new Date().toISOString(),
  },
  {
    id: "user-carol",
    name: "Carol Davis",
    avatar: "CD",
    color: "#4ade80", // green
    currentPage: "/analytics",
    lastSeen: new Date().toISOString(),
  },
];

// Current user
const CURRENT_USER: User = {
  id: sessionUserId,
  name: "You",
  avatar: "ME",
  color: "#fbbf24", // yellow
  currentPage: "/fleet",
  lastSeen: new Date().toISOString(),
};

export const usePresenceStore = create<PresenceState>((set) => {
  // Initialize with simulated users
  const initialUsers = new Map<string, User>();
  SIMULATED_USERS.forEach((user) => {
    initialUsers.set(user.id, user);
  });
  initialUsers.set(CURRENT_USER.id, CURRENT_USER);

  return {
    currentUserId: sessionUserId,
    users: initialUsers,
    isConnected: true,

    setCurrentUser: (updates) =>
      set((state) => {
        const currentUser = state.users.get(state.currentUserId);
        if (!currentUser) return state;

        const newUsers = new Map(state.users);
        newUsers.set(state.currentUserId, {
          ...currentUser,
          ...updates,
          lastSeen: new Date().toISOString(),
        });

        return { users: newUsers };
      }),

    updateUserPresence: (userId, updates) =>
      set((state) => {
        const user = state.users.get(userId);
        if (!user) return state;

        const newUsers = new Map(state.users);
        newUsers.set(userId, {
          ...user,
          ...updates,
          lastSeen: new Date().toISOString(),
        });

        return { users: newUsers };
      }),

    removeUser: (userId) =>
      set((state) => {
        const newUsers = new Map(state.users);
        newUsers.delete(userId);
        return { users: newUsers };
      }),

    setConnected: (connected) => set({ isConnected: connected }),
  };
});

// Selectors
export const selectOtherUsers = (state: PresenceState): User[] => {
  const others: User[] = [];
  state.users.forEach((user) => {
    if (user.id !== state.currentUserId) {
      others.push(user);
    }
  });
  return others;
};

export const selectUsersOnPage = (state: PresenceState, page: string): User[] => {
  const usersOnPage: User[] = [];
  state.users.forEach((user) => {
    if (user.currentPage === page && user.id !== state.currentUserId) {
      usersOnPage.push(user);
    }
  });
  return usersOnPage;
};

export const selectCurrentUser = (state: PresenceState): User | undefined => {
  return state.users.get(state.currentUserId);
};

import type { Meta, StoryObj } from "@storybook/react";
import { DroneCard } from "@/components/fleet/DroneCard";
import type { Drone } from "@/lib/domain/types";

const mockDrone: Drone = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Falcon Alpha-1",
  status: "online",
  batteryPct: 85,
  flightHours: 127.5,
  lastMission: "550e8400-e29b-41d4-a716-446655440001",
  updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  position: {
    lat: 37.7749,
    lng: -122.4194,
    alt: 50,
    speed: 5.2,
  },
  health: {
    signalStrength: 95,
    gpsQuality: 98,
    motorHealth: 92,
    overall: 95,
  },
};

const meta: Meta<typeof DroneCard> = {
  title: "Fleet/DroneCard",
  component: DroneCard,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DroneCard>;

export const Online: Story = {
  args: {
    drone: mockDrone,
  },
};

export const InMission: Story = {
  args: {
    drone: {
      ...mockDrone,
      name: "Falcon Bravo-2",
      status: "in-mission",
      batteryPct: 62,
    },
  },
};

export const Charging: Story = {
  args: {
    drone: {
      ...mockDrone,
      name: "Falcon Charlie-3",
      status: "charging",
      batteryPct: 45,
    },
  },
};

export const Offline: Story = {
  args: {
    drone: {
      ...mockDrone,
      name: "Falcon Delta-4",
      status: "offline",
      batteryPct: 12,
    },
  },
};

export const LowBattery: Story = {
  args: {
    drone: {
      ...mockDrone,
      name: "Falcon Echo-5",
      status: "online",
      batteryPct: 8,
    },
  },
};

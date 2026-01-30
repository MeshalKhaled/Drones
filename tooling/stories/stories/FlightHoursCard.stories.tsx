import type { Meta, StoryObj } from "@storybook/react";
import { FlightHoursCard } from "@/components/analytics/FlightHoursCard";
import type { FlightHoursData } from "@/lib/domain/analytics";

const mockData: FlightHoursData = {
  total: 1247.5,
  byDrone: [
    { droneId: "drone-1", droneName: "Falcon Alpha-1", hours: 127.5 },
    { droneId: "drone-2", droneName: "Falcon Bravo-2", hours: 98.3 },
    { droneId: "drone-3", droneName: "Falcon Charlie-3", hours: 156.2 },
  ],
};

const meta: Meta<typeof FlightHoursCard> = {
  title: "Analytics/FlightHoursCard",
  component: FlightHoursCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FlightHoursCard>;

export const Default: Story = {
  args: {
    data: mockData,
  },
};

export const HighHours: Story = {
  args: {
    data: {
      ...mockData,
      total: 5432.1,
    },
  },
};

export const LowHours: Story = {
  args: {
    data: {
      ...mockData,
      total: 89.3,
    },
  },
};

export const ManyDrones: Story = {
  args: {
    data: {
      total: 2500.0,
      byDrone: [
        { droneId: "drone-1", droneName: "Falcon Alpha-1", hours: 350.5 },
        { droneId: "drone-2", droneName: "Falcon Bravo-2", hours: 298.3 },
        { droneId: "drone-3", droneName: "Falcon Charlie-3", hours: 456.2 },
        { droneId: "drone-4", droneName: "Falcon Delta-4", hours: 312.1 },
        { droneId: "drone-5", droneName: "Falcon Echo-5", hours: 283.4 },
      ],
    },
  },
};

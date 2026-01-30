import type { Meta, StoryObj } from "@storybook/react";
import { BatteryHealthChart } from "@/components/analytics/BatteryHealthChart";
import type { BatteryHealthData } from "@/lib/domain/analytics";

const generateTimestamps = (days: number): string[] => {
  const timestamps: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    timestamps.push(date.toISOString());
  }
  return timestamps;
};

const mockData: BatteryHealthData = {
  timestamps: generateTimestamps(7),
  averages: [85, 82, 88, 79, 84, 81, 86],
  byDrone: [
    {
      droneId: "drone-1",
      droneName: "Falcon Alpha-1",
      data: [
        { timestamp: "", battery: 90 },
        { timestamp: "", battery: 87 },
        { timestamp: "", battery: 92 },
        { timestamp: "", battery: 85 },
        { timestamp: "", battery: 88 },
        { timestamp: "", battery: 84 },
        { timestamp: "", battery: 91 },
      ],
    },
    {
      droneId: "drone-2",
      droneName: "Falcon Bravo-2",
      data: [
        { timestamp: "", battery: 82 },
        { timestamp: "", battery: 78 },
        { timestamp: "", battery: 85 },
        { timestamp: "", battery: 72 },
        { timestamp: "", battery: 80 },
        { timestamp: "", battery: 76 },
        { timestamp: "", battery: 83 },
      ],
    },
    {
      droneId: "drone-3",
      droneName: "Falcon Charlie-3",
      data: [
        { timestamp: "", battery: 83 },
        { timestamp: "", battery: 81 },
        { timestamp: "", battery: 87 },
        { timestamp: "", battery: 80 },
        { timestamp: "", battery: 84 },
        { timestamp: "", battery: 83 },
        { timestamp: "", battery: 84 },
      ],
    },
  ],
};

const meta: Meta<typeof BatteryHealthChart> = {
  title: "Analytics/BatteryHealthChart",
  component: BatteryHealthChart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[400px] w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof BatteryHealthChart>;

export const Default: Story = {
  args: {
    data: mockData,
  },
};

export const LowBatteryTrend: Story = {
  args: {
    data: {
      ...mockData,
      averages: [65, 58, 52, 48, 45, 42, 38],
    },
  },
};

export const StableBatteries: Story = {
  args: {
    data: {
      ...mockData,
      averages: [92, 91, 93, 92, 91, 92, 93],
    },
  },
};

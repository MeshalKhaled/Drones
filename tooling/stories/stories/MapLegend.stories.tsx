import type { Meta, StoryObj } from "@storybook/react";
import { MapLegend } from "@/components/map/MapLegend";

const meta: Meta<typeof MapLegend> = {
  title: "Map/MapLegend",
  component: MapLegend,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative h-48 w-64 rounded-lg bg-[#141416]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MapLegend>;

export const Default: Story = {};

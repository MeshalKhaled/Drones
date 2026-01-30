import type { Meta, StoryObj } from "@storybook/react";
import {
  PresenceIndicator,
  PresenceIndicatorCompact,
  PresenceList,
} from "@/components/ui/PresenceIndicator";

const meta: Meta<typeof PresenceIndicator> = {
  title: "Collaboration/PresenceIndicator",
  component: PresenceIndicator,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PresenceIndicator>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="rounded-lg border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
};

export const Compact: StoryObj<typeof PresenceIndicatorCompact> = {
  render: () => <PresenceIndicatorCompact />,
  decorators: [
    (Story) => (
      <div className="rounded-lg border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
};

export const List: StoryObj<typeof PresenceList> = {
  render: () => <PresenceList />,
  decorators: [
    (Story) => (
      <div className="w-64 rounded-lg border border-[#1a1a1c] bg-[#0a0a0b] p-4">
        <Story />
      </div>
    ),
  ],
};

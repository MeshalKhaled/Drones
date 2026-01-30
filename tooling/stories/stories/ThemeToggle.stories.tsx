import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggle, ThemeToggleCompact } from "@/components/layout/ThemeToggle";

const meta: Meta<typeof ThemeToggle> = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {};

export const Compact: StoryObj<typeof ThemeToggleCompact> = {
  render: () => <ThemeToggleCompact />,
};

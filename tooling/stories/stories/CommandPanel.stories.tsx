import type { Meta, StoryObj } from "@storybook/react";
import { CommandPanel } from "@/components/drones/CommandPanel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof CommandPanel> = {
  title: "Drones/CommandPanel",
  component: CommandPanel,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[600px]">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CommandPanel>;

export const Default: Story = {
  args: {
    droneId: "550e8400-e29b-41d4-a716-446655440000",
  },
};

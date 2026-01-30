import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TelemetryCard } from "@/components/drones/TelemetryCard";

// Create a query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const meta: Meta<typeof TelemetryCard> = {
  title: "Drones/TelemetryCard",
  component: TelemetryCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-3xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TelemetryCard>;

export const Default: Story = {
  args: {
    droneId: "drone-001",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Live telemetry card showing position, altitude, speed, battery, and GPS quality. Polls for updates every second.",
      },
    },
  },
};

export const DifferentDrone: Story = {
  args: {
    droneId: "drone-002",
  },
};

// Note: The TelemetryCard uses the useTelemetryPolling hook which fetches
// data from /api/telemetry. In Storybook, you may need to mock this API
// or use MSW (Mock Service Worker) for full functionality.

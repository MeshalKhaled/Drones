import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "UI/ConfirmationDialog",
  component: ConfirmationDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ConfirmationDialog>;

// Interactive wrapper component
function DialogWrapper(props: React.ComponentProps<typeof ConfirmationDialog>) {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Open Dialog
      </button>
      <ConfirmationDialog
        {...props}
        isOpen={isOpen}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}

export const Warning: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    isOpen: false,
    title: "Confirm Action",
    message:
      "Are you sure you want to proceed with this action? This will affect the selected drone.",
    variant: "warning",
    confirmLabel: "Proceed",
    cancelLabel: "Cancel",
  },
};

export const Danger: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    isOpen: false,
    title: "Delete Mission",
    message:
      "This action cannot be undone. All mission data including waypoints and flight logs will be permanently deleted.",
    variant: "danger",
    confirmLabel: "Delete",
    cancelLabel: "Keep Mission",
  },
};

export const ArmDrone: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    isOpen: false,
    title: "Arm Drone",
    message:
      "You are about to arm the drone motors. Ensure the area is clear and it is safe to proceed.",
    variant: "warning",
    confirmLabel: "Arm Motors",
    cancelLabel: "Cancel",
  },
};

export const EmergencyStop: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    isOpen: false,
    title: "Emergency Stop",
    message:
      "This will immediately halt all drone operations and may cause the drone to land unexpectedly. Use only in emergencies.",
    variant: "danger",
    confirmLabel: "Emergency Stop",
    cancelLabel: "Cancel",
  },
};

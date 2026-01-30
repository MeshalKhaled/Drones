"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Radio, Plane, LandPlot, Home, Loader2, Lock } from "lucide-react";
import { sendDroneCommandAction, type DroneCommand } from "@/app/actions/drones";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { surface, border, text } from "@/lib/theme";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import {
  useDroneCommandState,
  getCommandErrorMessage,
  type CommandAvailability,
} from "@/hooks/ui/useDroneCommandState";

interface CommandPanelProps {
  droneId: string;
}

interface CommandConfig {
  command: DroneCommand;
  label: string;
  icon: typeof Radio;
  color: string;
  disabledColor: string;
  requiresConfirmation: boolean;
  confirmVariant?: "warning" | "danger";
  confirmTitle?: string;
  confirmMessage?: string;
}

const commands: CommandConfig[] = [
  {
    command: "ARM",
    label: "Arm",
    icon: Radio,
    color: "bg-blue-500 hover:bg-blue-600",
    disabledColor: "bg-blue-500/50",
    requiresConfirmation: false,
  },
  {
    command: "TAKEOFF",
    label: "Takeoff",
    icon: Plane,
    color: "bg-green-500 hover:bg-green-600",
    disabledColor: "bg-green-500/50",
    requiresConfirmation: false,
  },
  {
    command: "LAND",
    label: "Land",
    icon: LandPlot,
    color: "bg-yellow-500 hover:bg-yellow-600",
    disabledColor: "bg-yellow-500/50",
    requiresConfirmation: true,
    confirmVariant: "warning",
    confirmTitle: "Confirm Landing",
    confirmMessage:
      "The drone will begin landing at its current position. Make sure the landing area is clear.",
  },
  {
    command: "RTL",
    label: "Return to Launch",
    icon: Home,
    color: "bg-red-500 hover:bg-red-600",
    disabledColor: "bg-red-500/50",
    requiresConfirmation: true,
    confirmVariant: "danger",
    confirmTitle: "Confirm Return to Launch",
    confirmMessage:
      "The drone will abort its current mission and return to its launch point. This action cannot be undone.",
  },
];

export function CommandPanel({ droneId }: CommandPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingCommand, setPendingCommand] = useState<DroneCommand | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    command: DroneCommand | null;
    config: CommandConfig | null;
  }>({ isOpen: false, command: null, config: null });

  const { commandAvailability, isLoading: isLoadingState } = useDroneCommandState(droneId);

  const executeCommand = async (command: DroneCommand) => {
    setPendingCommand(command);

    startTransition(async () => {
      try {
        const result = await sendDroneCommandAction(droneId, command);

        if (result.success) {
          toast.success(`Command "${command}" sent successfully`);
          // Invalidate telemetry queries to force refresh
          queryClient.invalidateQueries({ queryKey: ["telemetry"] });
          queryClient.invalidateQueries({ queryKey: ["telemetry", "drone", droneId] });
          // Invalidate drone command state to update buttons
          queryClient.invalidateQueries({ queryKey: ["drone-command-state", droneId] });
          // Invalidate drones list query to update fleet page
          queryClient.invalidateQueries({ queryKey: ["drones"] });
          router.refresh(); // Refresh to show updated status
        } else {
          const errorCode = result.error?.code || "UNKNOWN";
          const errorMessage = getCommandErrorMessage(errorCode);
          toast.error(errorMessage);
        }
      } catch (error) {
        logger.error("Command error:", error);
        toast.error("An error occurred while sending the command");
      } finally {
        setPendingCommand(null);
      }
    });
  };

  const handleCommand = async (command: DroneCommand, config: CommandConfig) => {
    const availability = commandAvailability[command];

    // If command requires confirmation and is available, show dialog
    if (config.requiresConfirmation && availability.enabled) {
      setConfirmDialog({ isOpen: true, command, config });
      return;
    }

    // If not enabled, show reason
    if (!availability.enabled && availability.reason) {
      toast.error(availability.reason);
      return;
    }

    // Execute directly
    await executeCommand(command);
  };

  const handleConfirm = async () => {
    if (confirmDialog.command) {
      setConfirmDialog({ isOpen: false, command: null, config: null });
      await executeCommand(confirmDialog.command);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ isOpen: false, command: null, config: null });
  };

  const isSending = isPending || pendingCommand !== null;

  return (
    <>
      <div
        className={cn("rounded-md border p-6", surface.base, border.default)}
        role="region"
        aria-label="Drone command controls"
      >
        <h2 id="command-panel-title" className={cn("mb-4 text-lg font-semibold", text.primary)}>
          Drone Commands
        </h2>
        <div
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
          role="group"
          aria-labelledby="command-panel-title"
        >
          {commands.map((config) => {
            const {
              command,
              label,
              icon: Icon,
              color,
              disabledColor,
              requiresConfirmation,
            } = config;
            const isCommandPending = pendingCommand === command;
            const availability: CommandAvailability = commandAvailability[command];
            const isDisabled = !availability.enabled || (isSending && !isCommandPending);
            const isUnavailable = !availability.enabled;

            return (
              <button
                key={command}
                type="button"
                onClick={() => handleCommand(command, config)}
                disabled={isSending && !isCommandPending}
                aria-label={`${label} command${
                  isCommandPending
                    ? " - sending"
                    : isUnavailable
                      ? ` - ${availability.reason}`
                      : requiresConfirmation
                        ? " - requires confirmation"
                        : ""
                }`}
                aria-busy={isCommandPending}
                aria-disabled={isDisabled}
                title={isUnavailable ? availability.reason || undefined : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-md p-4 font-medium text-white transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                  isUnavailable ? disabledColor : color,
                  isUnavailable && "cursor-not-allowed",
                  !isUnavailable && "transform active:scale-95",
                  isSending && !isCommandPending && "cursor-not-allowed opacity-50",
                  isCommandPending &&
                    "animate-pulse ring-2 ring-white ring-offset-2 ring-offset-white dark:ring-offset-zinc-950"
                )}
              >
                {/* Confirmation indicator dot */}
                {requiresConfirmation && availability.enabled && !isCommandPending && (
                  <span
                    className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-300"
                    aria-hidden="true"
                  />
                )}

                {/* Icon */}
                {isCommandPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : isUnavailable ? (
                  <Lock className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Icon className="h-5 w-5" aria-hidden="true" />
                )}

                {/* Label */}
                <span className="text-sm">{isCommandPending ? "Sending..." : label}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs",
            border.default,
            text.muted
          )}
        >
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-400" aria-hidden="true" />
            <span>Requires confirmation</span>
          </div>
          {isLoadingState && (
            <div className="ml-auto flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              <span>Syncing state...</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.config && (
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          title={confirmDialog.config.confirmTitle || "Confirm Action"}
          message={confirmDialog.config.confirmMessage || "Are you sure?"}
          variant={confirmDialog.config.confirmVariant || "warning"}
          confirmLabel={confirmDialog.config.label}
          isLoading={isSending}
        />
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { surface, border, text, button } from "@/lib/theme";

type DialogVariant = "warning" | "danger";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  variant: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const variantConfig: Record<
  DialogVariant,
  { iconBg: string; iconColor: string; confirmButton: string }
> = {
  warning: {
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    confirmButton: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  danger: {
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    confirmButton: button.danger,
  },
};

export function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  variant,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
}: ConfirmationDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const config = variantConfig[variant];

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    },
    [onCancel, isLoading]
  );

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleKeyDown);

    // Focus the cancel button on open (safer default)
    cancelButtonRef.current?.focus();

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog Content */}
      <div
        className={cn(
          "relative z-10 mx-4 w-full max-w-md rounded-lg shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          surface.elevated,
          "border",
          border.default
        )}
      >
        {/* Header */}
        <div className={cn("flex items-start gap-4 border-b p-6", border.default)}>
          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
              config.iconBg
            )}
          >
            <AlertTriangle className={cn("h-5 w-5", config.iconColor)} aria-hidden="true" />
          </div>

          {/* Title and Message */}
          <div className="min-w-0 flex-1">
            <h2 id="confirmation-title" className={cn("text-lg font-semibold", text.primary)}>
              {title}
            </h2>
            <p id="confirmation-message" className={cn("mt-1 text-sm", text.muted)}>
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "flex-shrink-0 rounded-md p-1.5 transition-colors",
              text.muted,
              "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              isLoading && "cursor-not-allowed opacity-50"
            )}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              border.focus,
              button.secondary,
              isLoading && "cursor-not-allowed opacity-50"
            )}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-white",
              config.confirmButton,
              isLoading && "cursor-not-allowed opacity-50"
            )}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-zinc-200 dark:bg-zinc-800";
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-hidden="true"
    />
  );
}

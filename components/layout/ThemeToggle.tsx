"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

const themes: Array<{ value: ThemeValue; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid layout shift
    return (
      <div
        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800"
        role="radiogroup"
        aria-label="Theme selection"
      >
        {themes.map(({ value, icon: Icon }) => (
          <div key={value} className="flex items-center justify-center rounded-md p-2">
            <Icon size={16} className="text-zinc-400" aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={`Switch to ${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center rounded-md p-2 transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",
            theme === value
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100"
          )}
          title={label}
        >
          <Icon size={16} aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}

// Compact version for header - toggles between light and dark
export function ThemeToggleCompact() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Use resolvedTheme to determine actual current theme, then toggle
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    // Render placeholder
    return (
      <div
        className="rounded-md border border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-700 dark:bg-zinc-800"
        aria-label="Toggle theme"
      >
        <Sun size={18} className="text-zinc-400" aria-hidden="true" />
      </div>
    );
  }

  const Icon = resolvedTheme === "dark" ? Moon : Sun;
  const label = resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "rounded-md p-2 transition-all duration-150",
        "border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800",
        "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",
        "active:scale-95"
      )}
      aria-label={label}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

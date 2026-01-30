/**
 * R-134: Consolidated Design Tokens
 *
 * Theme utility classes for consistent styling across light and dark modes.
 * Uses Tailwind's dark: variant - NO CSS variables.
 *
 * Categories:
 * - surface: Background colors
 * - border: Border styles
 * - text: Typography colors
 * - badge: Status indicators
 * - input: Form elements
 * - button: Action buttons
 * - spacing: Consistent spacing
 * - radius: Border radius
 * - shadow: Box shadows
 * - animation: Motion/transitions
 */

// =============================================================================
// SPACING TOKENS
// =============================================================================
export const spacing = {
  /** Extra small padding/margin (4px) */
  xs: "1",
  /** Small padding/margin (8px) */
  sm: "2",
  /** Medium padding/margin (16px) */
  md: "4",
  /** Large padding/margin (24px) */
  lg: "6",
  /** Extra large padding/margin (32px) */
  xl: "8",
  /** 2x large padding/margin (48px) */
  "2xl": "12",
} as const;

// =============================================================================
// RADIUS TOKENS
// =============================================================================
export const radius = {
  /** Small radius for buttons, inputs */
  sm: "rounded",
  /** Medium radius for cards, panels */
  md: "rounded-md",
  /** Large radius for modals, large cards */
  lg: "rounded-lg",
  /** Extra large radius */
  xl: "rounded-xl",
  /** Full radius for pills, avatars */
  full: "rounded-full",
} as const;

// =============================================================================
// SHADOW TOKENS
// =============================================================================
export const shadow = {
  /** Subtle shadow for hover states */
  sm: "shadow-sm",
  /** Default shadow for cards */
  md: "shadow-md",
  /** Elevated shadow for modals, dropdowns */
  lg: "shadow-lg",
  /** Extra large shadow for popovers */
  xl: "shadow-xl",
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================
export const animation = {
  /** Fast transition (150ms) */
  fast: "transition-all duration-150",
  /** Default transition (200ms) */
  default: "transition-all duration-200",
  /** Slow transition (300ms) */
  slow: "transition-all duration-300",
  /** Ease-out timing */
  easeOut: "ease-out",
  /** Pulse animation for live indicators */
  pulse: "animate-pulse",
  /** Spin animation for loaders */
  spin: "animate-spin",
} as const;

// =============================================================================
// SURFACE TOKENS
// =============================================================================
export const surface = {
  /** Main page/card background */
  base: "bg-white dark:bg-zinc-950",
  /** Subtle/secondary surface (e.g., nested cards, stat blocks) */
  subtle: "bg-zinc-50 dark:bg-zinc-900",
  /** Elevated surface (modals, popovers, dropdowns) */
  elevated: "bg-white dark:bg-zinc-900 shadow-lg",
  /** Interactive hover state */
  hover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
} as const;

export const border = {
  /** Default border */
  default: "border-zinc-200 dark:border-zinc-800",
  /** Subtle border (dividers) */
  subtle: "border-zinc-100 dark:border-zinc-800/50",
  /** Focus ring */
  focus: "ring-blue-500 dark:ring-blue-400",
} as const;

export const text = {
  /** Primary text */
  primary: "text-zinc-900 dark:text-zinc-100",
  /** Secondary/muted text */
  muted: "text-zinc-500 dark:text-zinc-400",
  /** Inverted text (for badges, buttons) */
  inverted: "text-white dark:text-zinc-900",
} as const;

export const badge = {
  /** Status badges */
  online:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  "in-mission":
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  charging:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  offline:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  /** Mission status badges */
  pending:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  "in-progress":
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  completed:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  failed:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  cancelled:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
} as const;

export const input = {
  /** Base input styling */
  base: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
} as const;

export const button = {
  /** Primary action button */
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  /** Secondary/ghost button */
  secondary:
    "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100",
  /** Ghost button (minimal) */
  ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
  /** Danger button */
  danger: "bg-red-500 hover:bg-red-600 text-white",
} as const;

/** Chart theme colors based on current theme */
export function getChartTheme(isDark: boolean) {
  return {
    gridColor: isDark ? "#27272a" : "#e4e4e7",
    axisColor: isDark ? "#a1a1aa" : "#71717a",
    tooltipBg: isDark ? "#09090b" : "#ffffff",
    tooltipBorder: isDark ? "#27272a" : "#e4e4e7",
    tooltipText: isDark ? "#fafafa" : "#18181b",
    legendColor: isDark ? "#a1a1aa" : "#71717a",
  };
}

/** Mapbox map style based on current theme */
export function getMapStyle(isDark: boolean) {
  return isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";
}

// =============================================================================
// FOCUS TOKENS (R-099: WCAG AA Accessibility)
// =============================================================================
export const focus = {
  /** Default focus ring - visible, high contrast */
  ring: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
  /** Focus within for container elements */
  within: "focus-within:ring-2 focus-within:ring-blue-500",
  /** Visible focus (keyboard only) */
  visible:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
} as const;

// =============================================================================
// SEMANTIC COLORS (R-099: WCAG AA Contrast)
// =============================================================================
export const semantic = {
  /** Success state - meets 4.5:1 contrast ratio */
  success: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  /** Warning state - meets 4.5:1 contrast ratio */
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  /** Error state - meets 4.5:1 contrast ratio */
  error: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  /** Info state - meets 4.5:1 contrast ratio */
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================
export const typography = {
  /** Heading sizes */
  h1: "text-2xl font-bold tracking-tight",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
  h4: "text-base font-medium",
  /** Body text */
  body: "text-sm",
  bodyLarge: "text-base",
  /** Small/caption text */
  small: "text-xs",
  caption: "text-xs text-zinc-500 dark:text-zinc-400",
  /** Monospace for data/code */
  mono: "font-mono text-sm",
} as const;

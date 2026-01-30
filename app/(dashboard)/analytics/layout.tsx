import { ReactNode } from "react";

/**
 * R-157: Parallel Routes Layout for Analytics
 *
 * This layout uses Next.js parallel routes (@battery, @missions, @activity)
 * to enable simultaneous data fetching and independent streaming of each chart.
 * Each slot loads and renders independently, improving perceived performance.
 */
interface AnalyticsLayoutProps {
  children: ReactNode;
  battery: ReactNode;
  missions: ReactNode;
  activity: ReactNode;
}

export default function AnalyticsLayout({
  children,
  battery,
  missions,
  activity,
}: AnalyticsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Main page content (header + flight hours) */}
      {children}

      {/* Parallel route slots - each streams independently */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {battery}
        {missions}
        {activity}
      </div>
    </div>
  );
}

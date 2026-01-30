"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BatteryHealthData } from "@/lib/domain/analytics";

interface BatteryHealthChartProps {
  data: BatteryHealthData;
}

export function BatteryHealthChart({ data }: BatteryHealthChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare chart data
  const chartData = data.timestamps.map((timestamp, index) => {
    const point: Record<string, string | number> = {
      timestamp: new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Average: data.averages[index] ?? 0,
    };

    // Add top 3 drones
    data.byDrone.slice(0, 3).forEach((drone) => {
      const droneData = drone.data[index];
      if (droneData) {
        point[drone.droneName] = droneData.battery;
      }
    });

    return point;
  });

  const colors = ["#60a5fa", "#4ade80", "#fbbf24"];
  const isDark = mounted && resolvedTheme === "dark";

  // Theme-aware colors
  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const axisColor = isDark ? "#a1a1aa" : "#71717a";
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#fafafa" : "#18181b";

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Battery Health Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="timestamp"
            stroke={axisColor}
            style={{ fontSize: "12px" }}
            tick={{ fill: axisColor }}
          />
          <YAxis
            stroke={axisColor}
            style={{ fontSize: "12px" }}
            tick={{ fill: axisColor }}
            domain={[0, 100]}
            label={{
              value: "Battery %",
              angle: -90,
              position: "insideLeft",
              style: { fill: axisColor },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "6px",
              color: tooltipText,
            }}
            labelStyle={{ color: tooltipText }}
          />
          <Legend wrapperStyle={{ color: axisColor, fontSize: "12px" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="Average"
            stroke={axisColor}
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Fleet Average"
          />
          {data.byDrone.slice(0, 3).map((drone, index) => (
            <Line
              key={drone.droneId}
              type="monotone"
              dataKey={drone.droneName}
              stroke={colors[index]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

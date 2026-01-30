"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity, PowerOff } from "lucide-react";
import type { ActiveInactiveData } from "@/lib/domain/analytics";

interface ActiveInactiveChartProps {
  data: ActiveInactiveData;
}

const STATUS_COLORS: Record<string, string> = {
  online: "#4ade80",
  "in-mission": "#60a5fa",
  charging: "#fbbf24",
  offline: "#f87171",
};

export function ActiveInactiveChart({ data }: ActiveInactiveChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusData = data.byStatus.map((status) => ({
    status: status.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: status.count,
    color: STATUS_COLORS[status.status] || "#888",
  }));

  const isDark = mounted && resolvedTheme === "dark";

  // Theme-aware colors
  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const axisColor = isDark ? "#a1a1aa" : "#71717a";
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#fafafa" : "#18181b";

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center gap-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Drone Status Distribution
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-green-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Active: {data.active}</span>
          </div>
          <div className="flex items-center gap-2">
            <PowerOff size={16} className="text-zinc-400" />
            <span className="text-zinc-500 dark:text-zinc-400">Inactive: {data.inactive}</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="status"
            stroke={axisColor}
            style={{ fontSize: "12px" }}
            tick={{ fill: axisColor }}
          />
          <YAxis
            stroke={axisColor}
            style={{ fontSize: "12px" }}
            tick={{ fill: axisColor }}
            label={{
              value: "Count",
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
          <Legend wrapperStyle={{ color: axisColor, fontSize: "12px" }} iconType="square" />
          <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]}>
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-4">
        {statusData.map((status) => (
          <div key={status.status} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: status.color }} />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {status.status}: {status.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

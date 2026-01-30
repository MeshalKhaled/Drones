"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CheckCircle2 } from "lucide-react";
import type { MissionSuccessData } from "@/lib/domain/analytics";

interface MissionSuccessChartProps {
  data: MissionSuccessData;
}

const COLORS = {
  success: "#4ade80",
  failed: "#f87171",
  pending: "#fbbf24",
  cancelled: "#a1a1aa",
};

export function MissionSuccessChart({ data }: MissionSuccessChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    { name: "Successful", value: data.successful, color: COLORS.success },
    { name: "Failed", value: data.failed, color: COLORS.failed },
    {
      name: "Pending",
      value: data.byStatus.find((s) => s.status === "pending")?.count || 0,
      color: COLORS.pending,
    },
    {
      name: "Cancelled",
      value: data.byStatus.find((s) => s.status === "cancelled")?.count || 0,
      color: COLORS.cancelled,
    },
  ].filter((item) => item.value > 0);

  const isDark = mounted && resolvedTheme === "dark";

  // Theme-aware colors
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#fafafa" : "#18181b";
  const legendColor = isDark ? "#a1a1aa" : "#71717a";

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Mission Success Rate
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {data.successRate.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {data.successful}/{data.total} missions
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#888"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "6px",
              color: tooltipText,
            }}
            labelStyle={{ color: tooltipText }}
          />
          <Legend wrapperStyle={{ color: legendColor, fontSize: "12px" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

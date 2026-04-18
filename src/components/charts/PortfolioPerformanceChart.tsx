"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PerformanceDataPoint } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PortfolioPerformanceChartProps {
  data: PerformanceDataPoint[];
}

const tickFormatter = (value: number) => formatCurrency(value, true);

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: "8px",
    color: "var(--chart-tooltip-color)",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  itemStyle: { color: "var(--chart-tooltip-color)" },
  labelStyle: { color: "var(--chart-tooltip-color)", fontWeight: 600 },
};

export function PortfolioPerformanceChart({ data }: PortfolioPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear().toString().slice(2)}`;
          }}
          tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={tickFormatter}
          tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={tooltipStyle.contentStyle}
          itemStyle={tooltipStyle.itemStyle}
          labelStyle={tooltipStyle.labelStyle}
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === "portfolioValue"
              ? "Portfolio"
              : name === "niftyValue"
              ? "NIFTY 50"
              : "Invested",
          ]}
          labelFormatter={(label) => formatDate(label)}
        />
        <Legend
          formatter={(value) => {
            const labels: Record<string, string> = {
              portfolioValue: "Portfolio Value",
              niftyValue: "NIFTY 50 (scaled)",
              invested: "Invested",
            };
            return (
              <span style={{ color: "var(--chart-axis)", fontSize: 12 }}>
                {labels[value] ?? value}
              </span>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="invested"
          stroke="#94a3b8"
          strokeWidth={1}
          fill="url(#investedGrad)"
          strokeDasharray="4 4"
        />
        <Area
          type="monotone"
          dataKey="niftyValue"
          stroke="#f59e0b"
          strokeWidth={1.5}
          fill="url(#niftyGrad)"
        />
        <Area
          type="monotone"
          dataKey="portfolioValue"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#portfolioGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

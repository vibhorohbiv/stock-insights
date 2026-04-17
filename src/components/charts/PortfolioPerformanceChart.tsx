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

export function PortfolioPerformanceChart({ data }: PortfolioPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6b7280" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 13%)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear().toString().slice(2)}`;
          }}
          tick={{ fill: "hsl(215 16% 57%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={tickFormatter}
          tick={{ fill: "hsl(215 16% 57%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(222 47% 9%)",
            border: "1px solid hsl(222 47% 15%)",
            borderRadius: "8px",
            color: "hsl(213 31% 91%)",
            fontSize: 12,
          }}
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
              <span style={{ color: "hsl(215 16% 57%)", fontSize: 12 }}>
                {labels[value] ?? value}
              </span>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="invested"
          stroke="#6b7280"
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

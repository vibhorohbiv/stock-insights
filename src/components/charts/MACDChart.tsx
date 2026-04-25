"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { MACDPoint } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";

interface MACDChartProps {
  data: Array<{ date: string } & MACDPoint>;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: "8px",
    color: "var(--chart-tooltip-color)",
    fontSize: 12,
  },
  itemStyle: { color: "var(--chart-tooltip-color)" },
  labelStyle: { color: "var(--chart-tooltip-color)", fontWeight: 600 },
};

export function MACDChart({ data }: MACDChartProps) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
          }}
          tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={45}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip
          contentStyle={tooltipStyle.contentStyle}
          itemStyle={tooltipStyle.itemStyle}
          labelStyle={tooltipStyle.labelStyle}
          formatter={(value: number, name: string) => {
            const labels: Record<string, string> = {
              histogram: "Histogram",
              macd: "MACD",
              signal: "Signal",
            };
            return [value.toFixed(2), labels[name] ?? name];
          }}
          labelFormatter={(label) => formatDate(label)}
        />
        <ReferenceLine y={0} stroke="var(--chart-axis)" strokeOpacity={0.5} />
        <Bar
          dataKey="histogram"
          fill="#6366f1"
          opacity={0.7}
          // Color each bar by sign
          label={false}
        />
        <Line type="monotone" dataKey="macd" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
        <Line type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={1.5} dot={false} connectNulls strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

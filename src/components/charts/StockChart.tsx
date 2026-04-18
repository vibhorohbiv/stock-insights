"use client";

import { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HistoricalDataPoint } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calcSMA } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface StockChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
  sma50?: number | null;
  sma200?: number | null;
  projectedPrice?: number | null;
}

const PERIODS = ["1mo", "3mo", "6mo", "1y"] as const;
type Period = (typeof PERIODS)[number];

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

function computeChartData(data: HistoricalDataPoint[]) {
  const closes = data.map((d) => d.close);
  return data.map((d, i) => ({
    ...d,
    sma50: i >= 49 ? calcSMA(closes.slice(0, i + 1), 50) : null,
    sma200: i >= 199 ? calcSMA(closes.slice(0, i + 1), 200) : null,
  }));
}

export function StockChart({ data, symbol, sma50, sma200, projectedPrice }: StockChartProps) {
  const [period, setPeriod] = useState<Period>("1y");
  const [showSMA, setShowSMA] = useState(true);

  const periodDays: Record<Period, number> = {
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
  };

  const filteredData = data.slice(-periodDays[period]);
  const chartData = computeChartData(filteredData);
  const lastPrice = data[data.length - 1]?.close ?? 0;
  const firstPrice = filteredData[0]?.close ?? lastPrice;
  const isPositive = lastPrice >= firstPrice;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                period === p
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSMA(!showSMA)}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium transition-colors border",
            showSMA
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "text-muted-foreground hover:bg-secondary border-transparent"
          )}
        >
          SMA Lines
        </button>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
              <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={["auto", "auto"]}
            tickFormatter={(v) => formatCurrency(v, true)}
            tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            itemStyle={tooltipStyle.itemStyle}
            labelStyle={tooltipStyle.labelStyle}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                close: "Close",
                sma50: "SMA 50",
                sma200: "SMA 200",
              };
              return [formatCurrency(value), labels[name] ?? name];
            }}
            labelFormatter={(label) => formatDate(label)}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            fill="url(#stockGrad)"
            dot={false}
          />
          {showSMA && (
            <>
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#6366f1"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            </>
          )}
          {projectedPrice && (
            <ReferenceLine
              y={projectedPrice}
              stroke="#8b5cf6"
              strokeDasharray="6 3"
              label={{
                value: `Target: ${formatCurrency(projectedPrice, true)}`,
                position: "right",
                fill: "#8b5cf6",
                fontSize: 10,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HistoricalDataPoint } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calcSMA, calcBollingerSeries } from "@/lib/calculations";
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
  const bbSeries = calcBollingerSeries(closes);
  return data.map((d, i) => ({
    ...d,
    sma50: i >= 49 ? calcSMA(closes.slice(0, i + 1), 50) : null,
    sma200: i >= 199 ? calcSMA(closes.slice(0, i + 1), 200) : null,
    bbUpper: bbSeries[i].upper,
    bbMiddle: bbSeries[i].middle,
    bbLower: bbSeries[i].lower,
  }));
}

export function StockChart({ data, symbol, sma50, sma200, projectedPrice }: StockChartProps) {
  const [period, setPeriod] = useState<Period>("1y");
  const [showSMA, setShowSMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  const periodDays: Record<Period, number> = {
    "1mo": 30, "3mo": 90, "6mo": 180, "1y": 365,
  };

  const filteredData = data.slice(-periodDays[period]);
  const chartData = useMemo(() => computeChartData(filteredData), [filteredData]);

  const lastPrice = data[data.length - 1]?.close ?? 0;
  const firstPrice = filteredData[0]?.close ?? lastPrice;
  const isPositive = lastPrice >= firstPrice;
  const priceColor = isPositive ? "#10b981" : "#ef4444";

  const maxVolume = Math.max(...filteredData.map((d) => d.volume));

  return (
    <div className="space-y-3">
      {/* Controls */}
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
        <div className="flex gap-1.5">
          {[
            { label: "SMA", active: showSMA, toggle: () => setShowSMA(!showSMA), color: "amber" },
            { label: "Bollinger", active: showBB, toggle: () => setShowBB(!showBB), color: "purple" },
            { label: "Volume", active: showVolume, toggle: () => setShowVolume(!showVolume), color: "blue" },
          ].map(({ label, active, toggle, color }) => (
            <button
              key={label}
              onClick={toggle}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border",
                active
                  ? color === "amber"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                    : color === "purple"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/25"
                  : "text-muted-foreground hover:bg-secondary border-transparent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 rounded" style={{ backgroundColor: priceColor }} />
          <span>Actual Price</span>
        </div>
        {showSMA && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded bg-amber-400" />
              <span>SMA 50</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded bg-indigo-400" />
              <span>SMA 200</span>
            </div>
          </>
        )}
        {showBB && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded border-t border-dashed border-purple-400" />
            <span>Bollinger Bands</span>
          </div>
        )}
        {projectedPrice && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 rounded border-t border-dashed border-violet-400" />
            <span>30d projection</span>
          </div>
        )}
      </div>

      {/* Price chart */}
      <ResponsiveContainer width="100%" height={showVolume ? 260 : 320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={priceColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={priceColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.07} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
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
                close: "Actual Price",
                sma50: "SMA 50",
                sma200: "SMA 200",
                bbUpper: "BB Upper",
                bbMiddle: "BB Mid",
                bbLower: "BB Lower",
              };
              return [formatCurrency(value), labels[name] ?? name];
            }}
            labelFormatter={(label) => formatDate(label)}
          />

          {/* Bollinger Bands — rendered before price so price sits on top */}
          {showBB && (
            <>
              <Area
                type="monotone"
                dataKey="bbUpper"
                stroke="#8b5cf6"
                strokeWidth={1}
                strokeDasharray="4 2"
                fill="url(#bbGrad)"
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="bbMiddle"
                stroke="#8b5cf6"
                strokeWidth={1}
                dot={false}
                connectNulls
                opacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="bbLower"
                stroke="#8b5cf6"
                strokeWidth={1}
                strokeDasharray="4 2"
                fill="white"
                fillOpacity={0}
                dot={false}
                connectNulls
              />
            </>
          )}

          {/* Actual price */}
          <Area
            type="monotone"
            dataKey="close"
            stroke={priceColor}
            strokeWidth={2}
            fill="url(#stockGrad)"
            dot={false}
          />

          {/* SMA lines */}
          {showSMA && (
            <>
              <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
              <Line type="monotone" dataKey="sma200" stroke="#6366f1" strokeWidth={1.5} dot={false} connectNulls />
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

      {/* Volume chart */}
      {showVolume && (
        <ResponsiveContainer width="100%" height={70}>
          <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`
              }
              tick={{ fill: "var(--chart-axis)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={tooltipStyle.contentStyle}
              itemStyle={tooltipStyle.itemStyle}
              labelStyle={tooltipStyle.labelStyle}
              formatter={(value: number) => [
                value >= 1_000_000
                  ? `${(value / 1_000_000).toFixed(2)}M`
                  : `${(value / 1_000).toFixed(0)}K`,
                "Volume",
              ]}
              labelFormatter={(label) => formatDate(label)}
            />
            <Bar
              dataKey="volume"
              fill={priceColor}
              opacity={0.45}
              maxBarSize={8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      {showVolume && (
        <div className="text-xs text-muted-foreground text-right">Volume</div>
      )}
    </div>
  );
}

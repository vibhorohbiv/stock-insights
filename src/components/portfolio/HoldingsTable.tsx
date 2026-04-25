"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { PortfolioHolding } from "@/types";
import { formatCurrency, formatPercent, getPnLColor, cn } from "@/lib/utils";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { SignalBadge } from "@/components/portfolio/SignalBadge";

type SortKey = keyof Pick<
  PortfolioHolding,
  | "symbol"
  | "quantity"
  | "buyPrice"
  | "currentPrice"
  | "investedValue"
  | "currentValue"
  | "pnl"
  | "pnlPercent"
  | "dayChangePercent"
>;

type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "symbol", label: "Stock" },
  { key: "quantity", label: "Qty", align: "right" },
  { key: "buyPrice", label: "Avg Cost", align: "right" },
  { key: "currentPrice", label: "LTP", align: "right" },
  { key: "investedValue", label: "Invested", align: "right" },
  { key: "currentValue", label: "Curr. Value", align: "right" },
  { key: "pnl", label: "P&L", align: "right" },
  { key: "pnlPercent", label: "P&L %", align: "right" },
  { key: "dayChangePercent", label: "Day %", align: "right" },
];

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 text-primary" />
    : <ChevronDown className="w-3 h-3 text-primary" />;
}

export function HoldingsTable({ holdings }: { holdings: PortfolioHolding[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("currentValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const av = a[sortKey] ?? (sortKey === "symbol" ? "" : 0);
      const bv = b[sortKey] ?? (sortKey === "symbol" ? "" : 0);
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [holdings, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none whitespace-nowrap",
                  "hover:text-foreground transition-colors",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
            ))}
            <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right whitespace-nowrap">
              Signal
            </th>
            <th className="py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
              Trend
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {sorted.map((h) => {
            const isProfit = (h.pnl ?? 0) >= 0;
            const isDayUp = (h.dayChangePercent ?? 0) >= 0;
            return (
              <tr
                key={h.symbol}
                className="hover:bg-secondary/40 transition-colors group"
              >
                {/* Stock name */}
                <td className="py-3 px-3">
                  <Link
                    href={`/stock/${h.symbol}`}
                    className="flex items-center gap-2.5 group-hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {h.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{h.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {h.name ?? h.symbol}
                      </div>
                    </div>
                  </Link>
                </td>

                {/* Qty */}
                <td className="py-3 px-3 text-right font-medium tabular-nums">
                  {h.quantity}
                </td>

                {/* Avg Cost */}
                <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(h.buyPrice)}
                </td>

                {/* LTP */}
                <td className="py-3 px-3 text-right tabular-nums font-semibold">
                  <span
                    className={h.priceSource === "buy-price" ? "text-muted-foreground" : undefined}
                    title={h.priceSource === "buy-price" ? "Live price unavailable — showing buy price" : undefined}
                  >
                    {h.priceSource === "buy-price" && (
                      <span className="text-xs mr-0.5 opacity-50">~</span>
                    )}
                    {formatCurrency(h.currentPrice ?? 0)}
                  </span>
                </td>

                {/* Invested */}
                <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(h.investedValue ?? h.buyPrice * h.quantity)}
                </td>

                {/* Current Value */}
                <td className="py-3 px-3 text-right tabular-nums font-medium">
                  {formatCurrency(h.currentValue ?? 0)}
                </td>

                {/* P&L */}
                <td className={cn("py-3 px-3 text-right tabular-nums font-semibold", getPnLColor(h.pnl ?? 0))}>
                  {(h.pnl ?? 0) >= 0 ? "+" : ""}{formatCurrency(h.pnl ?? 0)}
                </td>

                {/* P&L % */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                      isProfit
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {isProfit ? "+" : ""}{formatPercent(h.pnlPercent ?? 0)}
                  </span>
                </td>

                {/* Day % */}
                <td className="py-3 px-3 text-right">
                  <span className={cn("text-xs font-medium", isDayUp ? "text-emerald-400" : "text-red-400")}>
                    {isDayUp ? "+" : ""}{formatPercent(h.dayChangePercent ?? 0)}
                  </span>
                </td>

                {/* Signal */}
                <td className="py-3 px-3 text-right">
                  {h.signal ? (
                    <div className="flex justify-end" title={h.signalReasons?.join(" · ")}>
                      <SignalBadge signal={h.signal} score={h.signalScore} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>

                {/* Sparkline */}
                <td className="py-3 px-3 text-right">
                  {h.sparkline && h.sparkline.length > 1 ? (
                    <div className="flex justify-end">
                      <MiniSparkline data={h.sparkline} positive={isProfit} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

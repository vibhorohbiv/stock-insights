"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PortfolioHolding } from "@/types";
import { formatCurrency, formatPercent, getPnLColor, getPnLBgColor, cn } from "@/lib/utils";
import { MiniSparkline } from "@/components/charts/MiniSparkline";

interface HoldingCardProps {
  holding: PortfolioHolding;
}

export function HoldingCard({ holding }: HoldingCardProps) {
  const isProfit = (holding.pnl ?? 0) >= 0;

  return (
    <Link href={`/stock/${holding.symbol}`}>
      <div className="glass-card-hover p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {holding.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground truncate">
                  {holding.symbol}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {holding.name ?? holding.symbol}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div>
                <div className="text-xs text-muted-foreground">Qty</div>
                <div className="text-sm font-medium">{holding.quantity}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg</div>
                <div className="text-sm font-medium">{formatCurrency(holding.buyPrice)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">LTP</div>
                <div className="text-sm font-medium">
                  {formatCurrency(holding.currentPrice ?? 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {holding.sparkline && holding.sparkline.length > 1 && (
              <MiniSparkline data={holding.sparkline} positive={isProfit} />
            )}
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                getPnLBgColor(holding.pnl ?? 0),
                getPnLColor(holding.pnl ?? 0)
              )}
            >
              {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatPercent(holding.pnlPercent ?? 0)}
            </div>
            <div className={cn("text-sm font-bold", getPnLColor(holding.pnl ?? 0))}>
              {formatCurrency(holding.pnl ?? 0)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { cn, formatCurrency, formatPercent, getPnLColor, getPnLBgColor } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changePercent?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  change,
  changePercent,
  icon,
  className,
}: MetricCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground">{subValue}</div>
      )}
      {changePercent !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium mt-1 w-fit px-2 py-0.5 rounded-full",
            getPnLBgColor(changePercent),
            getPnLColor(changePercent)
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {formatPercent(changePercent)}
        </div>
      )}
    </div>
  );
}

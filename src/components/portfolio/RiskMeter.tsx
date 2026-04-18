"use client";

import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
  level: "Low" | "Medium" | "High";
}

export function RiskMeter({ score, level }: RiskMeterProps) {
  const color =
    level === "Low"
      ? "bg-emerald-400"
      : level === "Medium"
      ? "bg-amber-400"
      : "bg-red-400";

  const textColor =
    level === "Low"
      ? "text-emerald-600"
      : level === "Medium"
      ? "text-amber-600"
      : "text-red-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Risk Level
        </span>
        <span className={cn("text-sm font-bold", textColor)}>{level}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}

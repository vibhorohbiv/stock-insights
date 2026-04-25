"use client";

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Signal = "buy" | "hold" | "caution" | "sell";

const CONFIG: Record<Signal, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
}> = {
  buy: {
    label: "Buy",
    icon: TrendingUp,
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/25",
  },
  hold: {
    label: "Hold",
    icon: Minus,
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/25",
  },
  caution: {
    label: "Caution",
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/25",
  },
  sell: {
    label: "Sell",
    icon: TrendingDown,
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/25",
  },
};

interface SignalBadgeProps {
  signal: Signal;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export function SignalBadge({ signal, score, size = "sm" }: SignalBadgeProps) {
  const cfg = CONFIG[signal];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold border",
        cfg.bg, cfg.text, cfg.border,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-sm",
      )}
    >
      <Icon className={cn("flex-shrink-0", size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
      {cfg.label}
      {score !== undefined && (
        <span className="opacity-60 font-normal">
          {score > 0 ? `+${score}` : score}
        </span>
      )}
    </span>
  );
}

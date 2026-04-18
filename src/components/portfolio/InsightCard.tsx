import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { PortfolioInsight } from "@/types";
import { cn } from "@/lib/utils";

const CONFIG = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    textColor: "text-amber-800",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    textColor: "text-blue-800",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-500",
    textColor: "text-emerald-800",
  },
  danger: {
    icon: XCircle,
    bg: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    textColor: "text-red-800",
  },
};

export function InsightCard({ insight }: { insight: PortfolioInsight }) {
  const cfg = CONFIG[insight.type];
  const Icon = cfg.icon;

  return (
    <div className={cn("flex gap-3 p-3 rounded-lg border", cfg.bg)}>
      <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", cfg.iconColor)} />
      <div>
        <div className={cn("text-sm font-medium", cfg.textColor)}>
          {insight.message}
        </div>
        {insight.detail && (
          <div className="text-xs text-muted-foreground mt-0.5">{insight.detail}</div>
        )}
      </div>
    </div>
  );
}

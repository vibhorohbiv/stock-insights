import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_00_00_000) {
      return `₹${(value / 1_00_00_000).toFixed(2)}Cr`;
    }
    if (Math.abs(value) >= 1_00_000) {
      return `₹${(value / 1_00_000).toFixed(2)}L`;
    }
    if (Math.abs(value) >= 1_000) {
      return `₹${(value / 1_000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isPositive(value: number): boolean {
  return value >= 0;
}

export function getPnLColor(value: number): string {
  return value >= 0 ? "text-emerald-400" : "text-red-400";
}

export function getPnLBgColor(value: number): string {
  return value >= 0 ? "bg-emerald-500/10" : "bg-red-500/10";
}

export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.NS$|\.BO$/, "");
}

export const SECTOR_COLORS: Record<string, string> = {
  "Information Technology": "#6366f1",
  "Financial Services": "#f59e0b",
  Healthcare: "#10b981",
  "Consumer Goods": "#3b82f6",
  Energy: "#f97316",
  Automobile: "#8b5cf6",
  Metals: "#ec4899",
  Pharma: "#14b8a6",
  Infrastructure: "#84cc16",
  Telecom: "#06b6d4",
  FMCG: "#a855f7",
  Banking: "#eab308",
  Others: "#6b7280",
};

export function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? SECTOR_COLORS["Others"];
}

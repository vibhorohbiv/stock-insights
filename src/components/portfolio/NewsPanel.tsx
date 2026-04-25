"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MarketNews } from "@/types";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (h >= 1) return `${h}h ago`;
  return `${m}m ago`;
}

const SENTIMENT_CONFIG = {
  positive: { label: "Bullish", icon: TrendingUp, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  negative: { label: "Bearish", icon: TrendingDown, cls: "text-red-400 bg-red-500/10 border-red-500/20" },
  neutral:  { label: "Neutral", icon: Minus,       cls: "text-muted-foreground bg-secondary border-border" },
};

interface NewsPanelProps {
  symbol?: string;
  limit?: number;
}

export function NewsPanel({ symbol, limit = 6 }: NewsPanelProps) {
  const { data: news, isLoading } = useQuery<MarketNews[]>({
    queryKey: ["news", symbol ?? "market"],
    queryFn: async () => {
      const url = symbol ? `/api/news?symbol=${symbol}` : "/api/news";
      const res = await fetch(url);
      if (!res.ok) throw new Error("News fetch failed");
      return res.json();
    },
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-secondary/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const items = (news ?? []).slice(0, limit);

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const s = item.sentiment ?? "neutral";
        const cfg = SENTIMENT_CONFIG[s];
        const Icon = cfg.icon;

        return (
          <a
            key={item.id}
            href={item.url === "#" ? undefined : item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/50 transition-colors",
              item.url === "#" ? "cursor-default" : "cursor-pointer"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1">
                {item.title}
              </p>
              {item.url !== "#" && (
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground mt-0.5" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn("inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border", cfg.cls)}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground">{item.source}</span>
              <span className="text-xs text-muted-foreground ml-auto">{timeAgo(item.publishedAt)}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

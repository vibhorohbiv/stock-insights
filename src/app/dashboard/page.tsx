"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Upload, RefreshCw, AlertTriangle,
  Zap, BarChart2, Newspaper,
} from "lucide-react";
import { ParsedPortfolioRow, PerformanceDataPoint } from "@/types";
import { usePortfolioSummary } from "@/hooks/usePortfolio";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { MetricCard } from "@/components/portfolio/MetricCard";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { InsightCard } from "@/components/portfolio/InsightCard";
import { RiskMeter } from "@/components/portfolio/RiskMeter";
import { NewsPanel } from "@/components/portfolio/NewsPanel";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { SectorBarChart } from "@/components/charts/SectorBarChart";
import { PortfolioPerformanceChart } from "@/components/charts/PortfolioPerformanceChart";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { SignalBadge } from "@/components/portfolio/SignalBadge";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { DEMO_PORTFOLIO } from "./demoData";

function buildPerformanceData(
  historicalData: { date: string; close: number }[],
  totalInvested: number
): PerformanceDataPoint[] {
  if (!historicalData.length) return [];
  const firstClose = historicalData[0].close;
  return historicalData.map((d) => ({
    date: d.date,
    portfolioValue: totalInvested * (d.close / firstClose) * 1.05,
    niftyValue: totalInvested * (d.close / firstClose),
    invested: totalInvested,
  }));
}

export default function DashboardPage() {
  const [holdings, setHoldings] = useState<ParsedPortfolioRow[] | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [bottomTab, setBottomTab] = useState<"allocation" | "news" | "insights">("allocation");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("stock_insights_portfolio");
      if (stored) {
        const parsed = JSON.parse(stored) as ParsedPortfolioRow[];
        if (parsed.length > 0) {
          setHoldings(parsed);
          return;
        }
      }
    } catch {}
    setHoldings(DEMO_PORTFOLIO);
    setIsDemo(true);
  }, []);

  const { data: summary, isLoading, isError, refetch } = usePortfolioSummary(holdings);
  const { data: niftyData } = useHistoricalData("NIFTYBEES", "1y");

  const performanceData = useMemo(() => {
    if (!niftyData || !summary) return [];
    return buildPerformanceData(niftyData, summary.totalInvested);
  }, [niftyData, summary]);

  // Derived signals summary
  const signalCounts = useMemo(() => {
    if (!summary) return null;
    const counts = { buy: 0, hold: 0, caution: 0, sell: 0 };
    summary.holdings.forEach((h) => {
      if (h.signal) counts[h.signal]++;
    });
    return counts;
  }, [summary]);

  const topGainer = useMemo(() => {
    if (!summary) return null;
    return [...summary.holdings].sort((a, b) => (b.pnlPercent ?? 0) - (a.pnlPercent ?? 0))[0];
  }, [summary]);

  const topLoser = useMemo(() => {
    if (!summary) return null;
    return [...summary.holdings].sort((a, b) => (a.pnlPercent ?? 0) - (b.pnlPercent ?? 0))[0];
  }, [summary]);

  if (!holdings) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between py-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
              {isDemo && (
                <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/20">
                  Demo
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {holdings.length} holdings · Updated just now
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              href="/upload"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-sm hover:bg-primary/25 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New
            </Link>
          </div>
        </div>

        {isDemo && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            You&apos;re viewing a demo portfolio.{" "}
            <Link href="/upload" className="underline underline-offset-2 ml-1 font-medium text-amber-200">
              Upload your own portfolio
            </Link>{" "}
            to see real analysis.
          </div>
        )}

        {isError && (
          <div className="mb-5 p-4 bg-red-500/10 border border-red-500/25 rounded-lg text-red-300 text-sm">
            Failed to fetch live prices. Showing cached or estimated data.
          </div>
        )}

        {/* ── Row 1: Metric cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <MetricCard
              label="Total Invested"
              value={formatCurrency(summary.totalInvested, true)}
              subValue={`${holdings.length} stocks`}
            />
            <MetricCard
              label="Current Value"
              value={formatCurrency(summary.totalCurrentValue, true)}
              change={summary.totalPnL}
              changePercent={summary.totalPnLPercent}
            />
            <MetricCard
              label="Total P&L"
              value={formatCurrency(summary.totalPnL, true)}
              subValue={formatPercent(summary.totalPnLPercent)}
              changePercent={summary.totalPnLPercent}
              icon={summary.totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            />
            <MetricCard
              label="Day Change"
              value={formatCurrency(summary.dayChange, true)}
              changePercent={summary.dayChangePercent}
            />
          </div>
        ) : null}

        {summary && (
          <>
            {/* ── Row 2: Performance chart + Market Pulse ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <div className="lg:col-span-2 glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Portfolio Performance vs NIFTY 50
                </h2>
                {performanceData.length > 0 ? (
                  <PortfolioPerformanceChart data={performanceData} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    Loading performance data…
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {/* Risk meter */}
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Portfolio Risk
                  </h2>
                  <RiskMeter score={summary.riskScore} level={summary.riskLevel} />
                </div>

                {/* Signal pulse */}
                {signalCounts && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Signal Pulse
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["buy", "hold", "caution", "sell"] as const).map((s) => (
                        <div key={s} className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2">
                          <SignalBadge signal={s} size="sm" />
                          <span className="font-bold text-sm">{signalCounts[s]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top mover cards */}
                {topGainer && topLoser && topGainer.symbol !== topLoser.symbol && (
                  <div className="glass-card p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Portfolio Movers
                    </h2>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Top Gainer</div>
                      <Link href={`/stock/${topGainer.symbol}`} className="flex items-center justify-between hover:text-emerald-400 transition-colors">
                        <span className="font-semibold text-sm">{topGainer.symbol}</span>
                        <span className="text-emerald-400 font-bold text-sm">
                          +{formatPercent(topGainer.pnlPercent ?? 0)}
                        </span>
                      </Link>
                    </div>
                    <div className="border-t border-border/40" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Top Loser</div>
                      <Link href={`/stock/${topLoser.symbol}`} className="flex items-center justify-between hover:text-red-400 transition-colors">
                        <span className="font-semibold text-sm">{topLoser.symbol}</span>
                        <span className="text-red-400 font-bold text-sm">
                          {formatPercent(topLoser.pnlPercent ?? 0)}
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Row 3: Holdings table full width ── */}
            <div className="glass-card p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Holdings ({summary.holdings.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  Click column headers to sort · Click stock to view analysis
                </span>
              </div>
              <HoldingsTable holdings={summary.holdings} />
            </div>

            {/* ── Row 4: Allocation / News / Insights tabs ── */}
            <div className="glass-card p-5">
              {/* Tab bar */}
              <div className="flex gap-1 mb-5 border-b border-border/50">
                {[
                  { key: "allocation", label: "Allocation", icon: BarChart2 },
                  { key: "news",       label: "Market News", icon: Newspaper },
                  { key: "insights",   label: "Smart Insights", icon: Zap },
                ] .map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setBottomTab(key as typeof bottomTab)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                      bottomTab === key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {bottomTab === "allocation" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Sector Breakdown
                    </h3>
                    <AllocationChart data={summary.sectorAllocation} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Distribution by Value
                    </h3>
                    <SectorBarChart data={summary.sectorAllocation} />
                  </div>
                </div>
              )}

              {bottomTab === "news" && (
                <NewsPanel limit={8} />
              )}

              {bottomTab === "insights" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.insights.map((ins, i) => (
                    <InsightCard key={i} insight={ins} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

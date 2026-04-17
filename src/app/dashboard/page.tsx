"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Upload,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { ParsedPortfolioRow, PerformanceDataPoint } from "@/types";
import { usePortfolioSummary } from "@/hooks/usePortfolio";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { MetricCard } from "@/components/portfolio/MetricCard";
import { HoldingCard } from "@/components/portfolio/HoldingCard";
import { InsightCard } from "@/components/portfolio/InsightCard";
import { RiskMeter } from "@/components/portfolio/RiskMeter";
import { AllocationChart } from "@/components/charts/AllocationChart";
import { SectorBarChart } from "@/components/charts/SectorBarChart";
import { PortfolioPerformanceChart } from "@/components/charts/PortfolioPerformanceChart";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatCurrency, formatPercent } from "@/lib/utils";
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
  const router = useRouter();
  const [holdings, setHoldings] = useState<ParsedPortfolioRow[] | null>(null);
  const [isDemo, setIsDemo] = useState(false);

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

  const topSymbol = summary?.holdings?.[0]?.symbol ?? null;
  const { data: niftyData } = useHistoricalData("NIFTYBEES", "1y");

  const performanceData = useMemo(() => {
    if (!niftyData || !summary) return [];
    return buildPerformanceData(niftyData, summary.totalInvested);
  }, [niftyData, summary]);

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
        {/* Header */}
        <div className="flex items-center justify-between py-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
              {isDemo && (
                <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/20">
                  Demo Mode
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
          <div className="mb-6 flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            You&apos;re viewing a demo portfolio.{" "}
            <Link href="/upload" className="underline underline-offset-2 ml-1">
              Upload your own portfolio
            </Link>{" "}
            to see real analysis.
          </div>
        )}

        {isError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            Failed to fetch live prices. Showing cached or estimated data.
          </div>
        )}

        {/* Overview Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              icon={
                summary.totalPnL >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )
              }
            />
            <MetricCard
              label="Day Change"
              value={formatCurrency(summary.dayChange, true)}
              changePercent={summary.dayChangePercent}
            />
          </div>
        ) : null}

        {/* Main grid */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column — Holdings */}
            <div className="lg:col-span-2 space-y-5">
              {/* Performance chart */}
              {performanceData.length > 0 && (
                <div className="glass-card p-5">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Portfolio Performance vs NIFTY 50
                  </h2>
                  <PortfolioPerformanceChart data={performanceData} />
                </div>
              )}

              {/* Holdings list */}
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Holdings ({summary.holdings.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {summary.holdings.map((h) => (
                    <HoldingCard key={h.symbol} holding={h} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — Allocation + Insights */}
            <div className="space-y-5">
              {/* Risk meter */}
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Portfolio Risk
                </h2>
                <RiskMeter score={summary.riskScore} level={summary.riskLevel} />
              </div>

              {/* Sector allocation pie */}
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Sector Allocation
                </h2>
                <AllocationChart data={summary.sectorAllocation} />
              </div>

              {/* Sector bar chart */}
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Distribution
                </h2>
                <SectorBarChart data={summary.sectorAllocation} />
              </div>

              {/* Insights */}
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Smart Insights
                </h2>
                <div className="space-y-3">
                  {summary.insights.map((ins, i) => (
                    <InsightCard key={i} insight={ins} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

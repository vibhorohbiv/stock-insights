"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { StockChart } from "@/components/charts/StockChart";
import { MACDChart } from "@/components/charts/MACDChart";
import { SignalBadge } from "@/components/portfolio/SignalBadge";
import { NewsPanel } from "@/components/portfolio/NewsPanel";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { calcTechnicals, calcMACDSeries, calcSignalScore } from "@/lib/calculations";
import { formatCurrency, formatPercent, formatNumber, getPnLColor, cn } from "@/lib/utils";
import { useMemo } from "react";

function RSIGauge({ rsi }: { rsi: number }) {
  const color = rsi > 70 ? "text-red-400" : rsi < 30 ? "text-emerald-400" : "text-amber-400";
  const label = rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">RSI (14)</span>
        <span className={cn("font-bold", color)}>{rsi.toFixed(1)} · {label}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", rsi > 70 ? "bg-red-400" : rsi < 30 ? "bg-emerald-400" : "bg-amber-400")}
          style={{ width: `${Math.min(rsi, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
  const { data: historical, isLoading: histLoading } = useHistoricalData(symbol, "1y");

  const technicals = useMemo(() => {
    if (!historical || historical.length < 20) return null;
    return calcTechnicals(historical);
  }, [historical]);

  const macdData = useMemo(() => {
    if (!historical || historical.length < 26) return [];
    const closes = historical.map((d) => d.close);
    const series = calcMACDSeries(closes);
    return historical.map((d, i) => ({ date: d.date, ...series[i] }));
  }, [historical]);

  const signalResult = useMemo(() => {
    if (!historical || historical.length < 20) return null;
    return calcSignalScore(historical.map((d) => d.close));
  }, [historical]);

  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* ── Quote header ── */}
        {quoteLoading ? (
          <div className="space-y-3 mb-5"><SkeletonCard /></div>
        ) : quote ? (
          <div className="glass-card p-6 mb-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                    {symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{symbol}</h1>
                    <p className="text-muted-foreground text-sm">{quote.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="neutral">{quote.sector}</Badge>
                  <Badge variant={isPositive ? "profit" : "loss"}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {formatPercent(quote.changePercent)} today
                  </Badge>
                  {technicals?.trend && (
                    <Badge variant={technicals.trend === "bullish" ? "profit" : technicals.trend === "bearish" ? "loss" : "neutral"}>
                      <Activity className="w-3 h-3" />
                      {technicals.trend.charAt(0).toUpperCase() + technicals.trend.slice(1)}
                    </Badge>
                  )}
                  {signalResult && (
                    <SignalBadge signal={signalResult.signal} score={signalResult.score} size="md" />
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold">{formatCurrency(quote.price)}</div>
                <div className={cn("text-lg font-semibold mt-1", getPnLColor(quote.change))}>
                  {quote.change >= 0 ? "+" : ""}{formatCurrency(quote.change)} ({formatPercent(quote.changePercent)})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border/50">
              {[
                { label: "Open",    value: formatCurrency(quote.open) },
                { label: "High",    value: formatCurrency(quote.high) },
                { label: "Low",     value: formatCurrency(quote.low) },
                { label: "Volume",  value: formatNumber(quote.volume) },
                { label: "52W High",value: formatCurrency(quote.week52High ?? 0) },
                { label: "52W Low", value: formatCurrency(quote.week52Low ?? 0) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="font-semibold mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 glass-card text-muted-foreground mb-5">Could not load quote for {symbol}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Charts ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Price + Volume + Bollinger */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Price Chart
              </h2>
              {histLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : historical && historical.length > 0 ? (
                <StockChart
                  data={historical}
                  symbol={symbol}
                  sma50={technicals?.sma50}
                  sma200={technicals?.sma200}
                  projectedPrice={technicals?.projectedPrice ?? undefined}
                />
              ) : (
                <p className="text-muted-foreground text-sm">No historical data available.</p>
              )}
            </div>

            {/* MACD */}
            {macdData.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    MACD (12, 26, 9)
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-amber-400 inline-block rounded" />MACD</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-400 inline-block rounded border-dashed border-t border-red-400" />Signal</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500/60 inline-block rounded-sm" />Histogram</span>
                  </div>
                </div>
                <MACDChart data={macdData} />
                <p className="text-xs text-muted-foreground mt-2">
                  Bullish when MACD crosses above signal line · Bearish when it crosses below
                </p>
              </div>
            )}

            {/* News */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Market News
              </h2>
              <NewsPanel symbol={symbol} limit={5} />
            </div>
          </div>

          {/* ── Right: Technicals ── */}
          <div className="space-y-4">

            {/* Signal score card */}
            {signalResult && (
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Signal Score
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <SignalBadge signal={signalResult.signal} score={signalResult.score} size="lg" />
                  <div className="text-xs text-muted-foreground">
                    Score: {signalResult.score > 0 ? `+${signalResult.score}` : signalResult.score} / 10
                  </div>
                </div>
                <div className="space-y-1.5">
                  {signalResult.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary/60" />
                      {r}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-3 pt-3 border-t border-border/40">
                  Not financial advice — technical signals only
                </p>
              </div>
            )}

            {/* Technicals */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Technical Indicators
              </h2>
              {technicals ? (
                <div className="space-y-4">
                  {technicals.rsi !== null && <RSIGauge rsi={technicals.rsi} />}

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        label: "SMA 50",
                        value: technicals.sma50 ? formatCurrency(technicals.sma50) : "N/A",
                        sub: technicals.sma50 && quote
                          ? quote.price > technicals.sma50 ? "Price above SMA50 ✓" : "Price below SMA50 ✗"
                          : "",
                        positive: !!(technicals.sma50 && quote && quote.price > technicals.sma50),
                      },
                      {
                        label: "SMA 200",
                        value: technicals.sma200 ? formatCurrency(technicals.sma200) : "N/A",
                        sub: technicals.sma200 && quote
                          ? quote.price > technicals.sma200 ? "Price above SMA200 ✓" : "Price below SMA200 ✗"
                          : "",
                        positive: !!(technicals.sma200 && quote && quote.price > technicals.sma200),
                      },
                      {
                        label: "Volatility (Ann.)",
                        value: technicals.volatility ? `${(technicals.volatility * 100).toFixed(1)}%` : "N/A",
                        sub: technicals.volatility
                          ? technicals.volatility > 0.4 ? "High volatility"
                            : technicals.volatility > 0.2 ? "Moderate volatility"
                            : "Low volatility"
                          : "",
                        positive: !!(technicals.volatility && technicals.volatility < 0.3),
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-secondary/40 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="font-bold mt-0.5">{item.value}</div>
                        {item.sub && (
                          <div className={cn("text-xs mt-0.5", item.positive ? "text-emerald-400" : "text-red-400")}>
                            {item.sub}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {technicals.projectedPrice && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <div className="text-xs text-purple-400 font-medium">30-Day Projection (Linear Regression)</div>
                      <div className="text-xl font-bold text-purple-300 mt-1">
                        {formatCurrency(technicals.projectedPrice)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Statistical trend only — not financial advice
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Not enough data for technical analysis.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

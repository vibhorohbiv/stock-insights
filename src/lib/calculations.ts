import { HistoricalDataPoint, PortfolioInsight, TechnicalIndicators } from "@/types";

// ── Basic ────────────────────────────────────────────────────────────────────

export function calcSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[0]);
    } else {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
  }
  return result;
}

export function calcRSI(data: number[], period = 14): number | null {
  if (data.length < period + 1) return null;
  const changes = data.slice(1).map((v, i) => v - data[i]);
  const gains = changes.map((c) => (c > 0 ? c : 0));
  const losses = changes.map((c) => (c < 0 ? Math.abs(c) : 0));

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calcVolatility(prices: number[], annualize = true): number | null {
  if (prices.length < 2) return null;
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  return annualize ? stdDev * Math.sqrt(252) : stdDev;
}

export function linearRegressionForecast(prices: number[], forecastDays: number): number | null {
  if (prices.length < 10) return null;
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = prices.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, xi, i) => a + xi * prices[i], 0);
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return intercept + slope * (n + forecastDays);
}

// ── MACD ─────────────────────────────────────────────────────────────────────

export interface MACDPoint {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function calcMACDSeries(prices: number[], fast = 12, slow = 26, signalPeriod = 9): MACDPoint[] {
  if (prices.length < slow) return prices.map(() => ({ macd: null, signal: null, histogram: null }));

  const ema12 = calcEMA(prices, fast);
  const ema26 = calcEMA(prices, slow);
  const macdLine = prices.map((_, i) => (i >= slow - 1 ? ema12[i] - ema26[i] : null));

  // Signal line: EMA of the MACD values (only where MACD exists)
  const macdValues = macdLine.filter((v): v is number => v !== null);
  const signalValues = calcEMA(macdValues, signalPeriod);

  let signalIdx = 0;
  return macdLine.map((macd, i) => {
    if (macd === null) return { macd: null, signal: null, histogram: null };
    const sig = signalValues[signalIdx++] ?? null;
    return {
      macd,
      signal: sig,
      histogram: sig !== null ? macd - sig : null,
    };
  });
}

// ── Bollinger Bands ───────────────────────────────────────────────────────────

export interface BollingerPoint {
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export function calcBollingerSeries(prices: number[], period = 20, multiplier = 2): BollingerPoint[] {
  return prices.map((_, i) => {
    if (i < period - 1) return { upper: null, middle: null, lower: null };
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    return {
      upper: parseFloat((mean + multiplier * stdDev).toFixed(2)),
      middle: parseFloat(mean.toFixed(2)),
      lower: parseFloat((mean - multiplier * stdDev).toFixed(2)),
    };
  });
}

// ── Signal Score ─────────────────────────────────────────────────────────────

export interface SignalResult {
  signal: "buy" | "hold" | "caution" | "sell";
  score: number;
  reasons: string[];
}

export function calcSignalScore(closes: number[]): SignalResult {
  let score = 0;
  const reasons: string[] = [];

  if (closes.length < 2) return { signal: "hold", score: 0, reasons: ["Insufficient data"] };

  const last = closes[closes.length - 1];
  const rsi = calcRSI(closes);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const sma20 = calcSMA(closes, Math.min(20, closes.length));

  // RSI signals
  if (rsi !== null) {
    if (rsi < 30) { score += 2; reasons.push(`RSI ${rsi.toFixed(0)} — oversold (potential bounce)`); }
    else if (rsi < 40) { score += 1; reasons.push(`RSI ${rsi.toFixed(0)} — approaching oversold`); }
    else if (rsi > 70) { score -= 2; reasons.push(`RSI ${rsi.toFixed(0)} — overbought`); }
    else if (rsi > 60) { score -= 1; reasons.push(`RSI ${rsi.toFixed(0)} — approaching overbought`); }
    else { reasons.push(`RSI ${rsi.toFixed(0)} — neutral zone`); }
  }

  // SMA cross signals
  if (sma50 && sma200) {
    if (sma50 > sma200) { score += 2; reasons.push("Golden cross: SMA50 > SMA200 (bullish)"); }
    else { score -= 2; reasons.push("Death cross: SMA50 < SMA200 (bearish)"); }
  }

  // Price vs SMA20
  if (sma20) {
    if (last > sma20) { score += 1; reasons.push("Price above 20-day SMA"); }
    else { score -= 1; reasons.push("Price below 20-day SMA"); }
  }

  // MACD cross
  if (closes.length >= 26) {
    const macdSeries = calcMACDSeries(closes);
    const lastMACD = macdSeries[macdSeries.length - 1];
    const prevMACD = macdSeries[macdSeries.length - 2];
    if (lastMACD.macd !== null && lastMACD.signal !== null &&
        prevMACD.macd !== null && prevMACD.signal !== null) {
      if (lastMACD.macd > lastMACD.signal && prevMACD.macd <= prevMACD.signal) {
        score += 2; reasons.push("MACD bullish crossover");
      } else if (lastMACD.macd < lastMACD.signal && prevMACD.macd >= prevMACD.signal) {
        score -= 2; reasons.push("MACD bearish crossover");
      } else if (lastMACD.histogram !== null) {
        if (lastMACD.histogram > 0) { score += 1; reasons.push("MACD positive momentum"); }
        else { score -= 1; reasons.push("MACD negative momentum"); }
      }
    }
  }

  // 30-day momentum
  if (closes.length >= 30) {
    const momentum = ((last / closes[closes.length - 31]) - 1) * 100;
    if (momentum > 8) { score += 1; reasons.push(`Strong 30d momentum (+${momentum.toFixed(1)}%)`); }
    else if (momentum < -8) { score -= 1; reasons.push(`Weak 30d momentum (${momentum.toFixed(1)}%)`); }
  }

  // Bollinger position
  if (closes.length >= 20) {
    const bb = calcBollingerSeries(closes);
    const lastBB = bb[bb.length - 1];
    if (lastBB.upper && last > lastBB.upper) { score -= 1; reasons.push("Price above Bollinger upper band"); }
    else if (lastBB.lower && last < lastBB.lower) { score += 1; reasons.push("Price below Bollinger lower band (oversold)"); }
  }

  const signal =
    score >= 4 ? "buy" :
    score >= 1 ? "hold" :
    score >= -2 ? "caution" : "sell";

  return { signal, score, reasons };
}

// ── Full technicals ───────────────────────────────────────────────────────────

export function calcTechnicals(historicalData: HistoricalDataPoint[]): Omit<TechnicalIndicators, "symbol"> {
  const closes = historicalData.map((d) => d.close);
  const sma50 = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const rsi = calcRSI(closes);
  const volatility = calcVolatility(closes);
  const projectedPrice = linearRegressionForecast(closes, 30);
  const lastPrice = closes[closes.length - 1];

  let trend: "bullish" | "bearish" | "neutral" = "neutral";
  if (sma50 && sma200) {
    if (lastPrice > sma50 && sma50 > sma200) trend = "bullish";
    else if (lastPrice < sma50 && sma50 < sma200) trend = "bearish";
  }

  return { sma50, sma200, rsi, volatility, trend, projectedPrice: projectedPrice ?? undefined };
}

// ── Portfolio insights ────────────────────────────────────────────────────────

export function generatePortfolioInsights(params: {
  sectorAllocation: Array<{ sector: string; percentage: number }>;
  holdings: Array<{ symbol: string; currentValue?: number }>;
  totalCurrentValue: number;
  volatility: number;
  riskLevel: string;
}): PortfolioInsight[] {
  const insights: PortfolioInsight[] = [];
  const { sectorAllocation, holdings, volatility, riskLevel } = params;

  const topSector = sectorAllocation[0];
  if (topSector && topSector.percentage > 40) {
    insights.push({
      type: "warning",
      message: `Overexposed to ${topSector.sector} sector (${topSector.percentage.toFixed(1)}%)`,
      detail: "Consider diversifying across more sectors to reduce concentration risk.",
    });
  }

  const top2Value = holdings.slice(0, 2).reduce((a, h) => a + (h.currentValue ?? 0), 0);
  const top2Pct = (top2Value / params.totalCurrentValue) * 100;
  if (top2Pct > 50) {
    insights.push({
      type: "danger",
      message: `High dependency on top 2 stocks (${top2Pct.toFixed(1)}% of portfolio)`,
      detail: "A decline in these stocks would significantly impact overall returns.",
    });
  }

  if (volatility > 0.3) {
    insights.push({
      type: "warning",
      message: "Portfolio volatility is high",
      detail: "Annual volatility exceeds 30%. Consider adding stable large-cap or debt instruments.",
    });
  }

  if (sectorAllocation.length < 4) {
    insights.push({
      type: "info",
      message: "Consider diversification across more sectors",
      detail: "A well-diversified portfolio typically spans 5–8 sectors to reduce unsystematic risk.",
    });
  }

  if (riskLevel === "Low") {
    insights.push({
      type: "success",
      message: "Portfolio risk is well-managed",
      detail: "Your portfolio shows low volatility and healthy diversification.",
    });
  }

  if (!sectorAllocation.find((s) => s.sector === "FMCG")) {
    insights.push({
      type: "info",
      message: "Underweight in FMCG — a defensive sector",
      detail: "FMCG stocks provide stability during downturns. Consider adding some exposure.",
    });
  }

  return insights;
}

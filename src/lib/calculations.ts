import { HistoricalDataPoint, PortfolioInsight, TechnicalIndicators } from "@/types";

export function calcSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
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

export function linearRegressionForecast(
  prices: number[],
  forecastDays: number
): number | null {
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

export function calcTechnicals(
  historicalData: HistoricalDataPoint[]
): Omit<TechnicalIndicators, "symbol"> {
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

  return { sma50, sma200, rsi, volatility, trend, projectedPrice };
}

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

  const top2Value = holdings
    .slice(0, 2)
    .reduce((a, h) => a + (h.currentValue ?? 0), 0);
  const top2Pct = (top2Value / params.totalCurrentValue) * 100;
  if (top2Pct > 50) {
    insights.push({
      type: "danger",
      message: `High dependency on top 2 stocks (${top2Pct.toFixed(1)}% of portfolio)`,
      detail: "Your portfolio is heavily concentrated. A decline in these stocks would significantly impact returns.",
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
      detail: "A well-diversified portfolio typically spans 5-8 sectors to reduce unsystematic risk.",
    });
  }

  if (riskLevel === "Low") {
    insights.push({
      type: "success",
      message: "Portfolio risk is well-managed",
      detail: "Your portfolio shows low volatility and healthy diversification.",
    });
  }

  if (sectorAllocation.find((s) => s.sector === "FMCG") === undefined) {
    insights.push({
      type: "info",
      message: "Underweight in FMCG — a defensive sector",
      detail: "FMCG stocks provide stability during market downturns. Consider adding some exposure.",
    });
  }

  return insights;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  currentPrice?: number;
  currentValue?: number;
  investedValue?: number;
  pnl?: number;
  pnlPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
  sector?: string;
  sparkline?: number[];
}

export interface ParsedPortfolioRow {
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  week52High?: number;
  week52Low?: number;
  sector?: string;
  timestamp: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface SectorPerformance {
  sector: string;
  change: number;
  changePercent: number;
  marketCap: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: PortfolioHolding[];
  sectorAllocation: SectorAllocation[];
  insights: PortfolioInsight[];
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PortfolioInsight {
  type: "warning" | "info" | "success" | "danger";
  message: string;
  detail?: string;
}

export interface TechnicalIndicators {
  symbol: string;
  sma50: number | null;
  sma200: number | null;
  rsi: number | null;
  volatility: number | null;
  trend: "bullish" | "bearish" | "neutral";
  projectedPrice?: number;
}

export interface PerformanceDataPoint {
  date: string;
  portfolioValue: number;
  niftyValue: number;
  invested: number;
}

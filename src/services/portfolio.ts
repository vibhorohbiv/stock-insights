import {
  ParsedPortfolioRow,
  PortfolioHolding,
  PortfolioSummary,
  SectorAllocation,
} from "@/types";
import { calcVolatility, generatePortfolioInsights, calcSignalScore } from "@/lib/calculations";
import { getSectorColor } from "@/lib/utils";
import { getMultipleQuotes, getHistoricalData } from "./yahooFinance";

const SECTOR_MAP: Record<string, string> = {
  RELIANCE: "Energy",
  TCS: "Information Technology",
  INFY: "Information Technology",
  HDFCBANK: "Financial Services",
  ICICIBANK: "Financial Services",
  WIPRO: "Information Technology",
  SBIN: "Financial Services",
  BAJFINANCE: "Financial Services",
  ASIANPAINT: "Consumer Goods",
  TATAMOTORS: "Automobile",
  MARUTI: "Automobile",
  SUNPHARMA: "Pharma",
  DRREDDY: "Pharma",
  HINDUNILVR: "FMCG",
  NESTLEIND: "FMCG",
  ONGC: "Energy",
  NTPC: "Energy",
  POWERGRID: "Infrastructure",
  BHARTIARTL: "Telecom",
  TECHM: "Information Technology",
  LT: "Infrastructure",
  ULTRACEMCO: "Infrastructure",
  KOTAKBANK: "Financial Services",
  AXISBANK: "Financial Services",
  TITAN: "Consumer Goods",
  BAJAJFINSV: "Financial Services",
  ADANIGREEN: "Energy",
  ADANIPORTS: "Infrastructure",
  JSWSTEEL: "Metals",
  TATASTEEL: "Metals",
  HINDALCO: "Metals",
  DIVISLAB: "Pharma",
  CIPLA: "Pharma",
  EICHERMOT: "Automobile",
  HEROMOTOCO: "Automobile",
};

export function getSector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] ?? "Others";
}

export async function buildPortfolioSummary(
  rows: ParsedPortfolioRow[]
): Promise<PortfolioSummary> {
  const symbols = Array.from(new Set(rows.map((r) => r.symbol)));

  const [quotes, historicalResults] = await Promise.all([
    getMultipleQuotes(symbols),
    Promise.all(symbols.map((s) => getHistoricalData(s, "3mo").catch(() => []))),
  ]);

  const quoteMap = new Map<string, (typeof quotes)[number]>();
  quotes.forEach((q) => { if (q) quoteMap.set(q.symbol, q); });

  const historicalMap = new Map<string, typeof historicalResults[number]>();
  symbols.forEach((s, i) => historicalMap.set(s, historicalResults[i]));

  const holdings: PortfolioHolding[] = rows.map((row) => {
    const quote = quoteMap.get(row.symbol);
    const hist = historicalMap.get(row.symbol) ?? [];
    const currentPrice = quote?.price ?? row.buyPrice;
    const investedValue = row.quantity * row.buyPrice;
    const currentValue = row.quantity * currentPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent = (pnl / investedValue) * 100;

    const sparkline = hist.slice(-30).map((d) => d.close);
    const closes = hist.map((d) => d.close);
    const { signal, score: signalScore, reasons: signalReasons } =
      closes.length >= 15 ? calcSignalScore(closes) : { signal: "hold" as const, score: 0, reasons: [] };

    return {
      symbol: row.symbol,
      name: quote?.name ?? row.symbol,
      quantity: row.quantity,
      buyPrice: row.buyPrice,
      buyDate: row.buyDate,
      currentPrice,
      currentValue,
      investedValue,
      pnl,
      pnlPercent,
      dayChange: quote ? quote.change * row.quantity : 0,
      dayChangePercent: quote?.changePercent ?? 0,
      sector: quote?.sector ?? getSector(row.symbol),
      priceSource: quote ? "live" : "buy-price",
      sparkline,
      signal,
      signalScore,
      signalReasons,
    } as PortfolioHolding;
  });

  // Sort by current value descending
  holdings.sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0));

  const totalInvested = holdings.reduce((s, h) => s + (h.investedValue ?? 0), 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + (h.currentValue ?? 0), 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent = (totalPnL / totalInvested) * 100;
  const dayChange = holdings.reduce((s, h) => s + (h.dayChange ?? 0), 0);
  const dayChangePercent = (dayChange / (totalCurrentValue - dayChange)) * 100;

  // Sector allocation
  const sectorMap = new Map<string, number>();
  holdings.forEach((h) => {
    const key = h.sector ?? "Others";
    sectorMap.set(key, (sectorMap.get(key) ?? 0) + (h.currentValue ?? 0));
  });

  const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / totalCurrentValue) * 100,
      color: getSectorColor(sector),
    }));

  // Volatility & risk
  let portfolioVolatility = 0.2;
  try {
    const closes = (historicalResults[0] ?? []).map((d: { close: number }) => d.close);
    portfolioVolatility = calcVolatility(closes) ?? 0.2;
  } catch {}

  const riskScore = Math.min(100, Math.round(portfolioVolatility * 200));
  const riskLevel =
    riskScore < 30 ? "Low" : riskScore < 60 ? "Medium" : "High";

  const insights = generatePortfolioInsights({
    sectorAllocation,
    holdings,
    totalCurrentValue,
    volatility: portfolioVolatility,
    riskLevel,
  });

  return {
    totalInvested,
    totalCurrentValue,
    totalPnL,
    totalPnLPercent,
    dayChange,
    dayChangePercent,
    holdings,
    sectorAllocation,
    insights,
    riskScore,
    riskLevel,
  };
}

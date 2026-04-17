/**
 * Stock API abstraction layer for Indian market data (NSE/BSE).
 * Primary: Yahoo Finance (yf-api) via API routes
 * Fallback: Alpha Vantage / mock data for development
 */
import { HistoricalDataPoint, MarketNews, SectorPerformance, StockQuote } from "@/types";

const BASE = "/api";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  return fetchJSON<StockQuote>(`${BASE}/quote?symbol=${encodeURIComponent(symbol)}`);
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  return fetchJSON<StockQuote[]>(
    `${BASE}/quote?symbols=${encodeURIComponent(symbols.join(","))}`
  );
}

export async function getHistoricalData(
  symbol: string,
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" = "1y"
): Promise<HistoricalDataPoint[]> {
  return fetchJSON<HistoricalDataPoint[]>(
    `${BASE}/historical?symbol=${encodeURIComponent(symbol)}&period=${period}`
  );
}

export async function getMarketNews(symbol?: string): Promise<MarketNews[]> {
  const qs = symbol ? `?symbol=${encodeURIComponent(symbol)}` : "";
  return fetchJSON<MarketNews[]>(`${BASE}/news${qs}`);
}

export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  return fetchJSON<SectorPerformance[]>(`${BASE}/sector`);
}

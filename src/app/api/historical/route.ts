import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/services/cache";
import { HistoricalDataPoint } from "@/types";

const PERIOD_MAP: Record<string, string> = {
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
  "2y": "2y",
  "5y": "5y",
};

async function fetchYahooHistorical(
  symbol: string,
  period: string
): Promise<HistoricalDataPoint[]> {
  const nseSym = `${symbol}.NS`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${nseSym}?interval=1d&range=${period}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  const data = await res.json();

  const result = data?.chart?.result?.[0];
  if (!result) throw new Error("No historical data");

  const timestamps: number[] = result.timestamp ?? [];
  const ohlcv = result.indicators?.quote?.[0];
  if (!ohlcv) throw new Error("No OHLCV data");

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      open: parseFloat((ohlcv.open?.[i] ?? 0).toFixed(2)),
      high: parseFloat((ohlcv.high?.[i] ?? 0).toFixed(2)),
      low: parseFloat((ohlcv.low?.[i] ?? 0).toFixed(2)),
      close: parseFloat((ohlcv.close?.[i] ?? 0).toFixed(2)),
      volume: ohlcv.volume?.[i] ?? 0,
    }))
    .filter((d) => d.close > 0);
}

function generateMockHistorical(
  symbol: string,
  days: number
): HistoricalDataPoint[] {
  const basePrice = 500 + (symbol.charCodeAt(0) * 37) % 3000;
  const points: HistoricalDataPoint[] = [];
  let price = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * price * 0.025;
    price = Math.max(price + change, 10);

    points.push({
      date: date.toISOString().split("T")[0],
      open: parseFloat((price * 0.995).toFixed(2)),
      high: parseFloat((price * 1.012).toFixed(2)),
      low: parseFloat((price * 0.988).toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 3_000_000) + 200_000,
    });
  }

  return points;
}

const PERIOD_DAYS: Record<string, number> = {
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1y": 365,
  "2y": 730,
  "5y": 1825,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const period = PERIOD_MAP[searchParams.get("period") ?? "1y"] ?? "1y";

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const cacheKey = `hist:${symbol}:${period}`;
  const cached = cache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  let data: HistoricalDataPoint[];
  try {
    data = await fetchYahooHistorical(symbol, period);
  } catch {
    data = generateMockHistorical(symbol, PERIOD_DAYS[period] ?? 365);
  }

  cache.set(cacheKey, data, TTL.HISTORICAL);
  return NextResponse.json(data);
}

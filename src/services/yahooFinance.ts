import { cache, TTL } from "@/services/cache";
import { HistoricalDataPoint, StockQuote } from "@/types";

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
  DRREDDY: "Pharma",
  EICHERMOT: "Automobile",
  HEROMOTOCO: "Automobile",
};

const YAHOO_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

// --- Quote ---

async function fetchYahooQuote(symbol: string): Promise<StockQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
  const res = await fetch(url, { headers: YAHOO_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status} for ${symbol}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No data for ${symbol}`);

  const prev = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
  const price = meta.regularMarketPrice ?? prev;
  const change = price - prev;

  return {
    symbol,
    name: meta.longName ?? meta.shortName ?? symbol,
    price,
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / prev) * 100).toFixed(2)),
    open: meta.regularMarketOpen ?? price,
    high: meta.regularMarketDayHigh ?? price,
    low: meta.regularMarketDayLow ?? price,
    volume: meta.regularMarketVolume ?? 0,
    week52High: meta.fiftyTwoWeekHigh ?? price,
    week52Low: meta.fiftyTwoWeekLow ?? price,
    sector: SECTOR_MAP[symbol] ?? "Others",
    timestamp: new Date().toISOString(),
  };
}

function mockQuote(symbol: string): StockQuote {
  const basePrice = 500 + Math.abs(symbol.charCodeAt(0) * 37 + (symbol.charCodeAt(1) ?? 0) * 13) % 4500;
  const change = (Math.random() - 0.48) * basePrice * 0.03;
  return {
    symbol,
    name: symbol,
    price: parseFloat(basePrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
    open: parseFloat((basePrice * 0.99).toFixed(2)),
    high: parseFloat((basePrice * 1.015).toFixed(2)),
    low: parseFloat((basePrice * 0.985).toFixed(2)),
    volume: Math.floor(Math.random() * 5_000_000) + 500_000,
    week52High: parseFloat((basePrice * 1.3).toFixed(2)),
    week52Low: parseFloat((basePrice * 0.7).toFixed(2)),
    sector: SECTOR_MAP[symbol] ?? "Others",
    timestamp: new Date().toISOString(),
  };
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = `quote:${symbol}`;
  const cached = cache.get<StockQuote>(cacheKey);
  if (cached) return cached;

  let quote: StockQuote;
  try {
    quote = await fetchYahooQuote(symbol);
  } catch {
    quote = mockQuote(symbol);
  }

  cache.set(cacheKey, quote, TTL.QUOTE);
  return quote;
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  return Promise.all(symbols.map(getQuote));
}

// --- Historical ---

const PERIOD_DAYS: Record<string, number> = {
  "1mo": 30, "3mo": 90, "6mo": 180, "1y": 365, "2y": 730, "5y": 1825,
};

async function fetchYahooHistorical(symbol: string, period: string): Promise<HistoricalDataPoint[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=${period}`;
  const res = await fetch(url, { headers: YAHOO_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Yahoo Finance ${res.status} for ${symbol}`);
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No historical data for ${symbol}`);

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

function generateMockHistorical(symbol: string, days: number): HistoricalDataPoint[] {
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

export async function getHistoricalData(symbol: string, period = "1y"): Promise<HistoricalDataPoint[]> {
  const cacheKey = `hist:${symbol}:${period}`;
  const cached = cache.get<HistoricalDataPoint[]>(cacheKey);
  if (cached) return cached;

  let data: HistoricalDataPoint[];
  try {
    data = await fetchYahooHistorical(symbol, period);
  } catch {
    data = generateMockHistorical(symbol, PERIOD_DAYS[period] ?? 365);
  }

  cache.set(cacheKey, data, TTL.HISTORICAL);
  return data;
}

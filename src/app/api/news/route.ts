import { NextRequest, NextResponse } from "next/server";
import { cache, TTL } from "@/services/cache";
import { MarketNews } from "@/types";

const MOCK_NEWS: MarketNews[] = [
  {
    id: "1",
    title: "Sensex surges 400 points on strong FII inflows",
    summary: "Indian equity markets rallied sharply as foreign institutional investors pumped in over ₹3,000 crore, led by buying in banking and IT stocks.",
    url: "#",
    source: "Economic Times",
    publishedAt: new Date(Date.now() - 3600_000).toISOString(),
    sentiment: "positive",
  },
  {
    id: "2",
    title: "RBI keeps repo rate unchanged at 6.5%, maintains withdrawal of accommodation",
    summary: "The Reserve Bank of India's Monetary Policy Committee unanimously decided to keep the benchmark repo rate unchanged at 6.5% citing inflation concerns.",
    url: "#",
    source: "Business Standard",
    publishedAt: new Date(Date.now() - 7200_000).toISOString(),
    sentiment: "neutral",
  },
  {
    id: "3",
    title: "IT sector outlook remains positive; TCS, Infosys to lead recovery",
    summary: "Analysts remain bullish on Indian IT stocks as deal momentum picks up and macro environment in the US improves.",
    url: "#",
    source: "Mint",
    publishedAt: new Date(Date.now() - 10800_000).toISOString(),
    sentiment: "positive",
  },
  {
    id: "4",
    title: "Crude oil prices dip 2% — good news for India's import bill",
    summary: "Brent crude fell below $80 per barrel, which could ease inflationary pressures in India and benefit oil-import-dependent sectors.",
    url: "#",
    source: "LiveMint",
    publishedAt: new Date(Date.now() - 14400_000).toISOString(),
    sentiment: "positive",
  },
  {
    id: "5",
    title: "FMCG stocks under pressure as rural demand recovery remains slow",
    summary: "Consumer staples companies are seeing margin pressure amid weak rural consumption and elevated input costs.",
    url: "#",
    source: "Financial Express",
    publishedAt: new Date(Date.now() - 18000_000).toISOString(),
    sentiment: "negative",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  const cacheKey = `news:${symbol ?? "market"}`;
  const cached = cache.get<MarketNews[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  cache.set(cacheKey, MOCK_NEWS, TTL.NEWS);
  return NextResponse.json(MOCK_NEWS);
}

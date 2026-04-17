import { NextResponse } from "next/server";
import { cache, TTL } from "@/services/cache";
import { SectorPerformance } from "@/types";

const MOCK_SECTORS: SectorPerformance[] = [
  { sector: "Information Technology", change: 245.3, changePercent: 1.8, marketCap: 32_50_000 },
  { sector: "Financial Services", change: 180.5, changePercent: 0.9, marketCap: 45_00_000 },
  { sector: "Energy", change: -120.2, changePercent: -0.7, marketCap: 28_00_000 },
  { sector: "Healthcare", change: 95.1, changePercent: 1.2, marketCap: 15_00_000 },
  { sector: "Consumer Goods", change: -45.8, changePercent: -0.3, marketCap: 18_50_000 },
  { sector: "Automobile", change: 320.6, changePercent: 2.1, marketCap: 12_00_000 },
  { sector: "Metals", change: -210.4, changePercent: -1.5, marketCap: 9_00_000 },
  { sector: "FMCG", change: 55.2, changePercent: 0.4, marketCap: 22_00_000 },
  { sector: "Telecom", change: 110.3, changePercent: 0.8, marketCap: 8_50_000 },
  { sector: "Infrastructure", change: -80.1, changePercent: -0.5, marketCap: 11_00_000 },
];

export async function GET() {
  const cacheKey = "sector:all";
  const cached = cache.get<SectorPerformance[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  cache.set(cacheKey, MOCK_SECTORS, TTL.SECTOR);
  return NextResponse.json(MOCK_SECTORS);
}

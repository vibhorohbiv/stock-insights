import { NextRequest, NextResponse } from "next/server";
import { getHistoricalData } from "@/services/yahooFinance";

const PERIOD_MAP: Record<string, string> = {
  "1mo": "1mo", "3mo": "3mo", "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const period = PERIOD_MAP[searchParams.get("period") ?? "1y"] ?? "1y";

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const data = await getHistoricalData(symbol, period);
  return NextResponse.json(data);
}

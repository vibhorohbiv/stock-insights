import { NextRequest, NextResponse } from "next/server";
import { buildPortfolioSummary } from "@/services/portfolio";
import { ParsedPortfolioRow } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: ParsedPortfolioRow[] = body.holdings;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "holdings array is required" },
        { status: 400 }
      );
    }

    const summary = await buildPortfolioSummary(rows);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("Portfolio build error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to build portfolio" },
      { status: 500 }
    );
  }
}

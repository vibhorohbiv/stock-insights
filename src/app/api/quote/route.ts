import { NextRequest, NextResponse } from "next/server";
import { getQuote, getMultipleQuotes } from "@/services/yahooFinance";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const symbols = searchParams.get("symbols");

  try {
    if (symbols) {
      const syms = symbols.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
      const quotes = await getMultipleQuotes(syms);
      return NextResponse.json(quotes.filter(Boolean));
    }
    if (symbol) {
      const quote = await getQuote(symbol.trim().toUpperCase());
      if (!quote) return NextResponse.json({ error: `No data for ${symbol}` }, { status: 404 });
      return NextResponse.json(quote);
    }
    return NextResponse.json({ error: "symbol or symbols required" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

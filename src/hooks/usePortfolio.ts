import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParsedPortfolioRow, PortfolioSummary } from "@/types";

const STORAGE_KEY = "stock_insights_portfolio";

export function usePortfolioStorage() {
  const getStored = (): ParsedPortfolioRow[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  };

  const setStored = (rows: ParsedPortfolioRow[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  };

  return { getStored, setStored };
}

export function usePortfolioSummary(rows: ParsedPortfolioRow[] | null) {
  return useQuery({
    queryKey: ["portfolio", rows?.map((r) => `${r.symbol}:${r.quantity}:${r.buyPrice}`).join(",")],
    queryFn: async (): Promise<PortfolioSummary> => {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: rows }),
      });
      if (!res.ok) throw new Error("Failed to fetch portfolio summary");
      return res.json();
    },
    enabled: !!rows && rows.length > 0,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

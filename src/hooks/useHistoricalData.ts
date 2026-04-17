import { useQuery } from "@tanstack/react-query";
import { getHistoricalData } from "@/services/stockApi";

type Period = "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y";

export function useHistoricalData(symbol: string | null, period: Period = "1y") {
  return useQuery({
    queryKey: ["historical", symbol, period],
    queryFn: () => getHistoricalData(symbol!, period),
    enabled: !!symbol,
    staleTime: 300_000,
  });
}

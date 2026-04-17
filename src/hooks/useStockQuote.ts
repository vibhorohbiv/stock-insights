import { useQuery } from "@tanstack/react-query";
import { getStockQuote, getMultipleQuotes } from "@/services/stockApi";

export function useStockQuote(symbol: string | null) {
  return useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => getStockQuote(symbol!),
    enabled: !!symbol,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMultipleQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes", symbols.sort().join(",")],
    queryFn: () => getMultipleQuotes(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

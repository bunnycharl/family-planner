import useSWR from "swr";
import { fetcher } from "../fetcher";
import type { CurrencyRateData } from "@/lib/finances/types";

export function useCurrencyRates(year: number | null) {
  const { data, error, isLoading, mutate } = useSWR<CurrencyRateData[]>(
    year ? `/api/budget/${year}/currency-rates` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  return {
    rates: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

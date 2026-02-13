import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseExchangeRatesParams {
  year: number;
}

export function useExchangeRates(params: UseExchangeRatesParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("year", String(params.year));

  const query = searchParams.toString();
  const url = `/api/finances/exchange-rates?${query}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    rates: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

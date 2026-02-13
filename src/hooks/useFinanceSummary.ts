import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseFinanceSummaryParams {
  year: number;
}

export function useFinanceSummary(params: UseFinanceSummaryParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("year", String(params.year));

  const query = searchParams.toString();
  const url = `/api/finances/summary?${query}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    summary: data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

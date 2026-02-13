import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useFinanceTaxRules() {
  const { data, error, isLoading, mutate } = useSWR("/api/finances/tax-rules", fetcher, {
    dedupingInterval: 10000,
  });

  return {
    rules: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useFinanceIncomeCategories() {
  const { data, error, isLoading, mutate } = useSWR("/api/finances/income-categories", fetcher, {
    dedupingInterval: 10000,
  });

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

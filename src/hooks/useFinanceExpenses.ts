import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseFinanceExpensesParams {
  year: number;
  group?: string;
}

export function useFinanceExpenses(params: UseFinanceExpensesParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("year", String(params.year));
  if (params.group) searchParams.set("group", params.group);

  const query = searchParams.toString();
  const url = `/api/finances/expenses?${query}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    entries: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

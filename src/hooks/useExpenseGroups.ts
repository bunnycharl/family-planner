import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useExpenseGroups() {
  const { data, error, isLoading, mutate } = useSWR("/api/finances/expense-groups", fetcher, {
    dedupingInterval: 10000,
  });

  return {
    groups: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

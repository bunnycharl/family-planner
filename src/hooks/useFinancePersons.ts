import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useFinancePersons() {
  const { data, error, isLoading, mutate } = useSWR("/api/finances/persons", fetcher, {
    dedupingInterval: 30000,
  });

  return {
    persons: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

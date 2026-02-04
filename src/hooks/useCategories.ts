import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR("/api/categories", fetcher);

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

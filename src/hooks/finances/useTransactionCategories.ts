import useSWR from "swr";
import { fetcher } from "../fetcher";
import type { TransactionCategoryData } from "@/lib/finances/types";

export function useTransactionCategories(year: number | null) {
  const { data, error, isLoading, mutate } = useSWR<TransactionCategoryData[]>(
    year ? `/api/budget/${year}/transaction-categories` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  return {
    categories: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

import useSWR from "swr";
import { fetcher } from "../fetcher";
import type { TransactionsListResponse } from "@/lib/finances/types";

export function useTransactions(year: number | null, month: number, categoryId?: string | null) {
  const params = new URLSearchParams({ month: String(month) });
  if (categoryId) params.set("categoryId", categoryId);

  const { data, error, isLoading, mutate } = useSWR<TransactionsListResponse>(
    year ? `/api/budget/${year}/transactions?${params}` : null,
    fetcher,
    { dedupingInterval: 2000 }
  );

  return {
    data: data ?? null,
    isLoading,
    isError: error,
    mutate,
  };
}

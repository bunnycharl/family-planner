import useSWR from "swr";
import { fetcher } from "../fetcher";
import type { BudgetYearData } from "@/lib/finances/types";

export function useBudgetYear(year: number | null) {
  const { data, error, isLoading, mutate } = useSWR<BudgetYearData>(
    year ? `/api/budget/${year}` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  return {
    data: data ?? null,
    isLoading,
    isError: error,
    mutate,
  };
}

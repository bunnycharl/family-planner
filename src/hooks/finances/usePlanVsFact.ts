import useSWR from "swr";
import { fetcher } from "../fetcher";
import type { PlanVsFactItem } from "@/lib/finances/types";

export function usePlanVsFact(year: number | null, month: number) {
  const { data, error, isLoading } = useSWR<PlanVsFactItem[]>(
    year ? `/api/budget/${year}/plan-vs-fact?month=${month}` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  return {
    items: data ?? [],
    isLoading,
    isError: error,
  };
}

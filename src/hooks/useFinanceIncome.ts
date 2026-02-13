import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseFinanceIncomeParams {
  year: number;
  personId: string;
}

export function useFinanceIncome(params: UseFinanceIncomeParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("year", String(params.year));
  searchParams.set("personId", params.personId);

  const query = searchParams.toString();
  const url = `/api/finances/income?${query}`;

  const { data, error, isLoading, mutate } = useSWR(params.personId ? url : null, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    entries: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

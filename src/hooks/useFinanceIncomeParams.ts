import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseFinanceIncomeParamsParams {
  year: number;
  personId: string;
}

export function useFinanceIncomeParams(params: UseFinanceIncomeParamsParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("year", String(params.year));
  searchParams.set("personId", params.personId);

  const query = searchParams.toString();
  const url = `/api/finances/income-params?${query}`;

  const { data, error, isLoading, mutate } = useSWR(params.personId ? url : null, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    params: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

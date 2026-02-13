import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseTasksParams {
  status?: string;
  categoryId?: string;
  assigneeId?: string;
  endDateFrom?: string;
  endDateTo?: string;
  phaseId?: string;
}

export function useTasks(params?: UseTasksParams) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.assigneeId) searchParams.set("assigneeId", params.assigneeId);
  if (params?.endDateFrom) searchParams.set("endDateFrom", params.endDateFrom);
  if (params?.endDateTo) searchParams.set("endDateTo", params.endDateTo);
  if (params?.phaseId) searchParams.set("phaseId", params.phaseId);

  const query = searchParams.toString();
  const url = `/api/tasks${query ? `?${query}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    tasks: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

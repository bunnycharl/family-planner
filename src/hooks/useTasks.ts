import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseTasksParams {
  status?: string;
  categoryId?: string;
  assigneeId?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  hasDueDate?: boolean;
}

export function useTasks(params?: UseTasksParams) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.assigneeId) searchParams.set("assigneeId", params.assigneeId);
  if (params?.dueDateStart) searchParams.set("dueDateStart", params.dueDateStart);
  if (params?.dueDateEnd) searchParams.set("dueDateEnd", params.dueDateEnd);
  if (params?.hasDueDate) searchParams.set("hasDueDate", "true");

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

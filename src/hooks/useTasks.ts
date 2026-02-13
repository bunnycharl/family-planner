import { useApiQuery } from "./useApi";

interface UseTasksParams {
  status?: string;
  categoryId?: string;
  assigneeId?: string;
  endDateFrom?: string;
  endDateTo?: string;
  phaseId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  position: number;
  startDate: string;
  endDate: string;
  categoryId?: string | null;
  category?: { id: string; name: string; color: string } | null;
  createdById: string;
  createdBy: { id: string; name: string; avatarColor: string };
  assigneeId?: string | null;
  assignee?: { id: string; name: string; avatarColor: string } | null;
  showOnRoadmap: boolean;
  phaseId?: string | null;
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

  const { data, isLoading, isError, mutate } = useApiQuery<Task[]>(url, {
    transform: (data) => data || [],
    dedupingInterval: 5000,
  });

  return {
    tasks: data,
    isLoading,
    isError,
    mutate,
  };
}

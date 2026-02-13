import { useApiQuery } from "./useApi";

interface UseEventsParams {
  start?: string;
  end?: string;
  categoryId?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  description?: string | null;
  category?: { id: string; name: string; color: string } | null;
  createdBy?: { id: string; name: string; avatarColor: string } | null;
  assignee?: { id: string; name: string; avatarColor: string } | null;
}

export function useEvents(params?: UseEventsParams) {
  const searchParams = new URLSearchParams();
  if (params?.start) searchParams.set("start", params.start);
  if (params?.end) searchParams.set("end", params.end);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);

  const query = searchParams.toString();
  const url = `/api/events${query ? `?${query}` : ""}`;

  const { data, isLoading, isError, mutate } = useApiQuery<Event[]>(url, {
    transform: (data) => data || [],
    dedupingInterval: 5000,
  });

  return {
    events: data,
    isLoading,
    isError,
    mutate,
  };
}

import useSWR from "swr";
import { fetcher } from "./fetcher";

interface UseEventsParams {
  start?: string;
  end?: string;
  categoryId?: string;
}

export function useEvents(params?: UseEventsParams) {
  const searchParams = new URLSearchParams();
  if (params?.start) searchParams.set("start", params.start);
  if (params?.end) searchParams.set("end", params.end);
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);

  const query = searchParams.toString();
  const url = `/api/events${query ? `?${query}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    events: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

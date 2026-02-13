import useSWR from "swr";
import { fetcher } from "./fetcher";

export function useRoadmap() {
  const { data, error, isLoading, mutate } = useSWR("/api/roadmap/phases", fetcher, {
    dedupingInterval: 5000,
  });

  return {
    phases: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

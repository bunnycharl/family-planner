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

export function useRoadmapTaskTypes() {
  const { data, error, isLoading, mutate } = useSWR("/api/roadmap/task-types", fetcher, {
    dedupingInterval: 30000,
  });

  return {
    taskTypes: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

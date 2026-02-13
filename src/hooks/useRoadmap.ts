import { useApiQuery } from "./useApi";

interface RoadmapPhase {
  id: string;
  name: string;
  emoji?: string | null;
  sortOrder: number;
  tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    startDate: string;
    endDate: string;
    category?: { id: string; name: string; color: string } | null;
  }>;
}

export function useRoadmap() {
  const { data, isLoading, isError, mutate } = useApiQuery<RoadmapPhase[]>("/api/roadmap/phases", {
    transform: (data) => data || [],
    dedupingInterval: 5000,
  });

  return {
    phases: data,
    isLoading,
    isError,
    mutate,
  };
}

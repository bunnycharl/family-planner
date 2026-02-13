import { useApiQuery } from "./useApi";

export interface RoadmapTask {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  position: number;
  startDate: string;
  endDate: string;
  phaseId: string;
  showOnRoadmap: boolean;
  categoryId?: string | null;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; avatarColor: string } | null;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  emoji: string | null;
  position: number;
  tasks: RoadmapTask[];
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

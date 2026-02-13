"use client";

import { useRoadmap, useRoadmapTaskTypes } from "@/hooks/useRoadmap";
import { GanttChart } from "./GanttChart";
import { GanttLegend } from "./GanttLegend";

export function RoadmapView() {
  const { phases, isLoading: phasesLoading, isError: phasesError } = useRoadmap();
  const { isLoading: typesLoading } = useRoadmapTaskTypes();

  const isLoading = phasesLoading || typesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
        <span className="text-sm font-bold uppercase text-[#999]">Загрузка...</span>
      </div>
    );
  }

  if (phasesError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <span className="text-sm font-bold uppercase text-[var(--c-coral)]">
          Ошибка загрузки данных
        </span>
      </div>
    );
  }

  if (phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <span className="text-sm font-bold uppercase text-[#999]">Нет данных для отображения</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
          Роадмап 2026&ndash;2035
        </h2>
      </div>
      <GanttLegend />
      <GanttChart phases={phases} />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRoadmap, useRoadmapTaskTypes } from "@/hooks/useRoadmap";
import type { ZoomLevel } from "@/lib/roadmap-utils";
import { GanttChart } from "./GanttChart";
import { GanttLegend } from "./GanttLegend";
import { RoadmapToolbar } from "./RoadmapToolbar";
import { RoadmapListView } from "./RoadmapListView";
import { PhaseFormModal } from "./PhaseFormModal";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailSheet } from "./TaskDetailSheet";

interface RoadmapTask {
  id: string;
  name: string;
  details: string | null;
  taskType: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  position: number;
  phaseId: string;
}

interface RoadmapPhase {
  id: string;
  name: string;
  emoji: string | null;
  position: number;
  tasks: RoadmapTask[];
}

export function RoadmapView() {
  const { phases, isLoading: phasesLoading, isError: phasesError, mutate } = useRoadmap();
  const { taskTypes, isLoading: typesLoading } = useRoadmapTaskTypes();

  // UI state
  const [zoom, setZoom] = useState<ZoomLevel>("quarter");
  const [isMobile, setIsMobile] = useState(false);

  // Modal state
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RoadmapTask | null>(null);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null);

  // Responsive detection
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSave = useCallback(() => {
    mutate();
  }, [mutate]);

  // Phase CRUD
  const handleAddPhase = useCallback(() => {
    setEditingPhase(null);
    setPhaseFormOpen(true);
  }, []);

  const handleEditPhase = useCallback((phase: RoadmapPhase) => {
    setEditingPhase(phase);
    setPhaseFormOpen(true);
  }, []);

  // Task CRUD
  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setDefaultPhaseId(phases.length > 0 ? phases[0].id : null);
    setTaskFormOpen(true);
  }, [phases]);

  const handleEditTask = useCallback((task: RoadmapTask) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: RoadmapTask) => {
    setSelectedTask(task);
  }, []);

  // Toggle completion with optimistic update
  const handleToggleCompletion = useCallback(
    async (task: RoadmapTask) => {
      const newValue = !task.isCompleted;

      // Optimistic update
      const previousPhases = phases;
      mutate(
        phases.map((p: RoadmapPhase) => ({
          ...p,
          tasks: p.tasks.map((t: RoadmapTask) =>
            t.id === task.id ? { ...t, isCompleted: newValue } : t
          ),
        })),
        false
      );

      // Also update selectedTask if it's the same task
      if (selectedTask?.id === task.id) {
        setSelectedTask({ ...task, isCompleted: newValue });
      }

      try {
        const res = await fetch(`/api/roadmap/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: newValue }),
        });

        if (!res.ok) throw new Error("Failed");
        mutate();
      } catch {
        mutate(previousPhases, false);
        toast.error("Не удалось обновить статус");
      }
    },
    [phases, mutate, selectedTask]
  );

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

  const taskTypeInfos = taskTypes.map((t: { key: string; label: string; color: string }) => ({
    key: t.key,
    label: t.label,
    color: t.color,
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
        <span className="bg-[var(--c-lavender)] px-4 py-1 rounded-xl inline-block text-white">
          Роадмап
        </span>
      </h1>

      {/* Toolbar */}
      <RoadmapToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onAddPhase={handleAddPhase}
        onAddTask={handleAddTask}
        hasPhases={phases.length > 0}
        isMobile={isMobile}
      />

      {/* Legend */}
      <GanttLegend taskTypes={taskTypeInfos} />

      {/* Empty state */}
      {phases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-3xl bg-[var(--c-gray)]">
          <span className="text-sm font-bold uppercase text-[#999]">Нет фаз — создайте первую</span>
          <button
            type="button"
            onClick={handleAddPhase}
            className="flex items-center gap-2 rounded-full bg-[var(--c-black)] px-6 py-3 text-sm font-bold uppercase text-white hover:opacity-80 transition-all cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Добавить фазу
          </button>
        </div>
      ) : isMobile ? (
        <RoadmapListView
          phases={phases}
          taskTypes={taskTypeInfos}
          onTaskClick={handleTaskClick}
          onToggleCompletion={handleToggleCompletion}
          onEditPhase={handleEditPhase}
        />
      ) : (
        <GanttChart
          phases={phases}
          zoom={zoom}
          taskTypes={taskTypeInfos}
          onTaskClick={handleTaskClick}
          onEditPhase={handleEditPhase}
          onToggleCompletion={handleToggleCompletion}
        />
      )}

      {/* Modals */}
      <PhaseFormModal
        isOpen={phaseFormOpen}
        onClose={() => {
          setPhaseFormOpen(false);
          setEditingPhase(null);
        }}
        phase={editingPhase}
        onSave={handleSave}
      />

      <TaskFormModal
        isOpen={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        phases={phases}
        taskTypes={taskTypeInfos}
        defaultPhaseId={defaultPhaseId}
        onSave={handleSave}
      />

      <TaskDetailSheet
        task={selectedTask}
        taskTypes={taskTypeInfos}
        onClose={() => setSelectedTask(null)}
        onEdit={handleEditTask}
        onToggleCompletion={handleToggleCompletion}
      />
    </div>
  );
}

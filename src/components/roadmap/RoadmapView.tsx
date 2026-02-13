"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useRoadmap } from "@/hooks/useRoadmap";
import type { ZoomLevel } from "@/lib/roadmap-utils";
import { GanttChart } from "./GanttChart";
import { GanttLegend } from "./GanttLegend";
import { RoadmapToolbar } from "./RoadmapToolbar";
import { RoadmapListView } from "./RoadmapListView";
import { PhaseFormModal } from "./PhaseFormModal";
import { TaskForm } from "../board/TaskForm";

interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

interface RoadmapTask {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  position: number;
  phaseId: string;
  category: CategoryInfo | null;
  categoryId?: string | null;
  assigneeId?: string | null;
}

interface RoadmapPhase {
  id: string;
  name: string;
  emoji: string | null;
  position: number;
  tasks: RoadmapTask[];
}

export function RoadmapView() {
  const { phases, isLoading, isError, mutate } = useRoadmap();

  // UI state
  const [zoom, setZoom] = useState<ZoomLevel>("quarter");
  const [isMobile, setIsMobile] = useState(false);

  // Modal state
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | null>(null);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RoadmapTask | null>(null);
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
    setTaskFormOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: RoadmapTask) => {
    setSelectedTask(task);
  }, []);

  const handleEditTask = useCallback((task: RoadmapTask) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  // Toggle completion with optimistic update (TODO <-> DONE)
  const handleToggleCompletion = useCallback(
    async (task: RoadmapTask) => {
      const newStatus = task.status === "DONE" ? "TODO" : "DONE";

      // Optimistic update
      const previousPhases = phases;
      mutate(
        phases.map((p: RoadmapPhase) => ({
          ...p,
          tasks: p.tasks.map((t: RoadmapTask) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          ),
        })),
        false
      );

      if (selectedTask?.id === task.id) {
        setSelectedTask({ ...task, status: newStatus });
      }

      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
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

  // Collect unique categories from tasks for legend
  const legendCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; color: string }[] = [];
    for (const phase of phases) {
      for (const t of phase.tasks ?? []) {
        if (t.category && !seen.has(t.category.id)) {
          seen.add(t.category.id);
          result.push({ name: t.category.name, color: t.category.color });
        }
      }
    }
    return result;
  }, [phases]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
        <span className="text-sm font-bold uppercase text-[#999]">Загрузка...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <span className="text-sm font-bold uppercase text-[var(--c-coral)]">
          Ошибка загрузки данных
        </span>
      </div>
    );
  }

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
      <GanttLegend categories={legendCategories} />

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
          onTaskClick={handleTaskClick}
          onToggleCompletion={handleToggleCompletion}
          onEditPhase={handleEditPhase}
        />
      ) : (
        <GanttChart
          phases={phases}
          zoom={zoom}
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

      <TaskForm
        isOpen={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        task={
          editingTask
            ? {
                id: editingTask.id,
                title: editingTask.title,
                description: editingTask.description,
                status: editingTask.status,
                startDate: editingTask.startDate,
                endDate: editingTask.endDate,
                phaseId: editingTask.phaseId,
                categoryId: editingTask.categoryId ?? null,
                assigneeId: editingTask.assigneeId ?? null,
              }
            : null
        }
        onSave={handleSave}
      />

      {/* Task detail sheet (reuse selected task for editing) */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTask(null)} />
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-3xl p-6 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full md:rounded-3xl md:shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-extrabold uppercase text-[var(--c-black)]">
                {selectedTask.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedTask.description && (
              <p className="text-sm text-[#666] mb-4">{selectedTask.description}</p>
            )}
            {selectedTask.category && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: selectedTask.category.color }}
                />
                <span className="text-xs font-bold uppercase text-[#666]">
                  {selectedTask.category.name}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleToggleCompletion(selectedTask)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold uppercase transition-all cursor-pointer ${
                  selectedTask.status === "DONE"
                    ? "bg-[var(--c-gray)] text-[var(--c-black)]"
                    : "bg-[var(--c-mint)] text-white"
                }`}
              >
                {selectedTask.status === "DONE" ? "Вернуть в работу" : "Завершить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  handleEditTask(selectedTask);
                }}
                className="rounded-full border-2 border-[var(--c-black)] px-4 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
              >
                Изменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

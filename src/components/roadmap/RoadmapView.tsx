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
import { MilestoneFormModal } from "./MilestoneFormModal";
import { MilestoneDetailSheet } from "./MilestoneDetailSheet";

interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

interface Milestone {
  id: string;
  name: string;
  details: string | null;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  position: number;
  phaseId: string;
  category: CategoryInfo | null;
}

interface RoadmapPhase {
  id: string;
  name: string;
  emoji: string | null;
  position: number;
  milestones: Milestone[];
}

export function RoadmapView() {
  const { phases, isLoading, isError, mutate } = useRoadmap();

  // UI state
  const [zoom, setZoom] = useState<ZoomLevel>("quarter");
  const [isMobile, setIsMobile] = useState(false);

  // Modal state
  const [phaseFormOpen, setPhaseFormOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | null>(null);
  const [milestoneFormOpen, setMilestoneFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

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

  // Milestone CRUD
  const handleAddMilestone = useCallback(() => {
    setEditingMilestone(null);
    setDefaultPhaseId(phases.length > 0 ? phases[0].id : null);
    setMilestoneFormOpen(true);
  }, [phases]);

  const handleEditMilestone = useCallback((milestone: Milestone) => {
    setEditingMilestone(milestone);
    setMilestoneFormOpen(true);
  }, []);

  const handleMilestoneClick = useCallback((milestone: Milestone) => {
    setSelectedMilestone(milestone);
  }, []);

  // Toggle completion with optimistic update
  const handleToggleCompletion = useCallback(
    async (milestone: Milestone) => {
      const newValue = !milestone.isCompleted;

      // Optimistic update
      const previousPhases = phases;
      mutate(
        phases.map((p: RoadmapPhase) => ({
          ...p,
          milestones: p.milestones.map((m: Milestone) =>
            m.id === milestone.id ? { ...m, isCompleted: newValue } : m
          ),
        })),
        false
      );

      if (selectedMilestone?.id === milestone.id) {
        setSelectedMilestone({ ...milestone, isCompleted: newValue });
      }

      try {
        const res = await fetch(`/api/roadmap/milestones/${milestone.id}`, {
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
    [phases, mutate, selectedMilestone]
  );

  // Collect unique categories from milestones for legend
  const legendCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; color: string }[] = [];
    for (const phase of phases) {
      for (const m of phase.milestones ?? []) {
        if (m.category && !seen.has(m.category.id)) {
          seen.add(m.category.id);
          result.push({ name: m.category.name, color: m.category.color });
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
        onAddMilestone={handleAddMilestone}
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
          onMilestoneClick={handleMilestoneClick}
          onToggleCompletion={handleToggleCompletion}
          onEditPhase={handleEditPhase}
        />
      ) : (
        <GanttChart
          phases={phases}
          zoom={zoom}
          onMilestoneClick={handleMilestoneClick}
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

      <MilestoneFormModal
        isOpen={milestoneFormOpen}
        onClose={() => {
          setMilestoneFormOpen(false);
          setEditingMilestone(null);
        }}
        milestone={editingMilestone}
        phases={phases}
        defaultPhaseId={defaultPhaseId}
        onSave={handleSave}
      />

      <MilestoneDetailSheet
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        onEdit={handleEditMilestone}
        onToggleCompletion={handleToggleCompletion}
      />
    </div>
  );
}

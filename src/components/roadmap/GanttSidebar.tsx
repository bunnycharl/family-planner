"use client";

import { cn } from "@/lib/utils";
import type { ZoomLevel } from "@/lib/roadmap-utils";

interface Milestone {
  id: string;
  name: string;
  details: string | null;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
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
  milestones: Milestone[];
}

interface GanttSidebarProps {
  phases: RoadmapPhase[];
  expandedMap: Record<string, boolean>;
  onTogglePhase: (phaseId: string) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
  onToggleCompletion: (milestone: Milestone) => void;
  zoom: ZoomLevel;
}

export function GanttSidebar({
  phases,
  expandedMap,
  onTogglePhase,
  onEditPhase,
  onToggleCompletion,
  zoom,
}: GanttSidebarProps) {
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);

  // Header height depends on zoom: year has 1 row, others have 2
  const showYearRow = zoom !== "year";

  return (
    <div className="sticky left-0 z-20 w-[340px] shrink-0 bg-[var(--c-gray)]">
      {/* Header placeholder to match timeline header */}
      <div>
        {showYearRow && <div className="h-[26px]" />}
        <div className="flex h-[30px] items-center border-b border-white/20">
          <div className="w-[180px] px-3 text-[10px] font-bold uppercase text-[#999]">Фаза</div>
          <div className="flex-1 px-3 text-[10px] font-bold uppercase text-[#999]">Веха</div>
        </div>
      </div>

      {/* Phase groups */}
      {sortedPhases.map((phase) => {
        const isExpanded = expandedMap[phase.id] ?? true;
        const sortedMilestones = [...phase.milestones].sort((a, b) => a.position - b.position);

        return (
          <div key={phase.id}>
            {/* Phase header */}
            <div className="flex h-10 items-center border-b-2 border-white/40">
              <button
                type="button"
                onClick={() => onTogglePhase(phase.id)}
                className="flex flex-1 items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <svg
                  className={cn(
                    "h-3 w-3 shrink-0 text-[#999] transition-transform",
                    isExpanded && "rotate-90"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {phase.emoji && <span className="text-sm">{phase.emoji}</span>}
                <span className="truncate text-xs font-bold uppercase text-[var(--c-black)]">
                  {phase.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onEditPhase(phase)}
                className="mr-2 flex h-6 w-6 items-center justify-center rounded-full text-[#999] opacity-0 transition-all hover:bg-white/40 hover:text-[var(--c-black)] group-hover:opacity-100 cursor-pointer [div:hover>&]:opacity-100"
                title="Редактировать фазу"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            {/* Milestone rows */}
            {isExpanded &&
              sortedMilestones.map((milestone) => (
                <div key={milestone.id} className="flex h-10 items-center border-b border-white/20">
                  {/* Empty phase column space */}
                  <div className="w-[180px] shrink-0 px-3">
                    {/* Completion checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleCompletion(milestone)}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                        milestone.isCompleted
                          ? "border-[var(--c-mint)] bg-[var(--c-mint)]"
                          : "border-[#ccc] hover:border-[var(--c-mint)]"
                      )}
                    >
                      {milestone.isCompleted && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 truncate px-3 text-xs font-bold uppercase text-[var(--c-black)]">
                    <span className={cn(milestone.isCompleted && "line-through opacity-50")}>
                      {milestone.name}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        );
      })}
    </div>
  );
}

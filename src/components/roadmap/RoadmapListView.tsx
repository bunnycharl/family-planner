"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MilestoneItem } from "./MilestoneItem";

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

interface RoadmapListViewProps {
  phases: RoadmapPhase[];
  onMilestoneClick: (milestone: Milestone) => void;
  onToggleCompletion: (milestone: Milestone) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
}

export function RoadmapListView({
  phases,
  onMilestoneClick,
  onToggleCompletion,
  onEditPhase,
}: RoadmapListViewProps) {
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    sortedPhases.forEach((p) => {
      map[p.id] = true;
    });
    return map;
  });

  const togglePhase = (phaseId: string) => {
    setExpandedMap((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  return (
    <div className="space-y-3">
      {sortedPhases.map((phase) => {
        const isExpanded = expandedMap[phase.id] ?? true;
        const sortedMilestones = [...phase.milestones].sort((a, b) => a.position - b.position);
        const completedCount = phase.milestones.filter((m) => m.isCompleted).length;

        return (
          <div key={phase.id} className="rounded-3xl bg-[var(--c-gray)] overflow-hidden">
            {/* Phase header */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="flex flex-1 items-center gap-2 px-4 py-3 cursor-pointer"
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
                {phase.emoji && <span className="text-base">{phase.emoji}</span>}
                <span className="text-sm font-bold uppercase text-[var(--c-black)] truncate">
                  {phase.name}
                </span>
                <span className="text-[10px] font-bold text-[#999] ml-auto">
                  {completedCount}/{phase.milestones.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onEditPhase(phase)}
                className="mr-3 flex h-7 w-7 items-center justify-center rounded-full text-[#999] hover:bg-white/40 hover:text-[var(--c-black)] transition-all cursor-pointer"
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

            {/* Milestones */}
            {isExpanded && sortedMilestones.length > 0 && (
              <div className="border-t border-white/30">
                {sortedMilestones.map((milestone) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    onToggleCompletion={onToggleCompletion}
                    onClick={onMilestoneClick}
                  />
                ))}
              </div>
            )}

            {isExpanded && sortedMilestones.length === 0 && (
              <div className="border-t border-white/30 px-4 py-4 text-center text-xs font-bold text-[#999] uppercase">
                Нет вех
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

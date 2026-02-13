"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { computeBarTracks } from "@/lib/roadmap-utils";

interface RoadmapTask {
  id: string;
  title: string;
  description: string | null;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
  startDate: string;
  endDate: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
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

interface GanttSidebarProps {
  phases: RoadmapPhase[];
  expandedMap: Record<string, boolean>;
  onTogglePhase: (phaseId: string) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
  onToggleCompletion: (task: RoadmapTask) => void;
  selectedYear: number;
}

export function GanttSidebar({
  phases,
  expandedMap,
  onTogglePhase,
  onEditPhase,
  onToggleCompletion,
  selectedYear,
}: GanttSidebarProps) {
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);

  // Compute row heights to match timeline
  const phaseHeights = useMemo(() => {
    return sortedPhases.map((phase) => {
      const visibleTasks = phase.tasks.filter((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return start.getFullYear() <= selectedYear && end.getFullYear() >= selectedYear;
      });
      const trackMap = computeBarTracks(visibleTasks);
      const maxTrack = visibleTasks.length > 0 ? Math.max(...Array.from(trackMap.values())) : 0;
      const rowHeight = visibleTasks.length > 0 ? (maxTrack + 1) * 40 : 40;
      return { visibleTasks, rowHeight };
    });
  }, [sortedPhases, selectedYear]);

  return (
    <div className="sticky left-0 z-20 w-[340px] shrink-0 bg-[var(--c-gray)]">
      {/* Phase groups */}
      {sortedPhases.map((phase, phaseIdx) => {
        const isExpanded = expandedMap[phase.id] ?? true;
        const { visibleTasks, rowHeight } = phaseHeights[phaseIdx];

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

            {/* Task rows — match timeline height */}
            {isExpanded && (
              <div
                className="relative border-b border-white/20 overflow-hidden"
                style={{ height: rowHeight }}
              >
                {visibleTasks.map((task) => (
                  <div key={task.id} className="flex h-10 items-center">
                    <div className="w-[180px] shrink-0 px-3">
                      <button
                        type="button"
                        onClick={() => onToggleCompletion(task)}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all cursor-pointer",
                          task.status === "DONE"
                            ? "border-[var(--c-mint)] bg-[var(--c-mint)]"
                            : "border-[#ccc] hover:border-[var(--c-mint)]"
                        )}
                      >
                        {task.status === "DONE" && (
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
                      <span className={cn(task.status === "DONE" && "line-through opacity-50")}>
                        {task.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

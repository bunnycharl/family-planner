"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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

interface RoadmapListViewProps {
  phases: RoadmapPhase[];
  onTaskClick: (task: RoadmapTask) => void;
  onToggleCompletion: (task: RoadmapTask) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
}

export function RoadmapListView({
  phases,
  onTaskClick,
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
        const sortedTasks = [...phase.tasks].sort((a, b) => a.position - b.position);
        const completedCount = phase.tasks.filter((t) => t.status === "DONE").length;

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
                  {completedCount}/{phase.tasks.length}
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

            {/* Tasks */}
            {isExpanded && sortedTasks.length > 0 && (
              <div className="border-t border-white/30">
                {sortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/20 last:border-b-0"
                  >
                    {/* Completion checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleCompletion(task)}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all cursor-pointer",
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

                    {/* Task info */}
                    <button
                      type="button"
                      onClick={() => onTaskClick(task)}
                      className="flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <div
                        className={cn(
                          "text-sm font-bold uppercase text-[var(--c-black)] truncate",
                          task.status === "DONE" && "line-through opacity-50"
                        )}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.category && (
                          <span className="flex items-center gap-1">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: task.category.color }}
                            />
                            <span className="text-[10px] font-bold text-[#999] uppercase">
                              {task.category.name}
                            </span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-[#999]">
                          {format(new Date(task.startDate), "d MMM", { locale: ru })} &ndash;{" "}
                          {format(new Date(task.endDate), "d MMM", { locale: ru })}
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isExpanded && sortedTasks.length === 0 && (
              <div className="border-t border-white/30 px-4 py-4 text-center text-xs font-bold text-[#999] uppercase">
                Нет задач
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

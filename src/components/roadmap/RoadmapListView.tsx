"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RoadmapTaskItem } from "./RoadmapTaskItem";

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

interface TaskTypeInfo {
  key: string;
  label: string;
  color: string;
}

interface RoadmapListViewProps {
  phases: RoadmapPhase[];
  taskTypes: TaskTypeInfo[];
  onTaskClick: (task: RoadmapTask) => void;
  onToggleCompletion: (task: RoadmapTask) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
}

export function RoadmapListView({
  phases,
  taskTypes,
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
        const completedCount = phase.tasks.filter((t) => t.isCompleted).length;

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
                  <RoadmapTaskItem
                    key={task.id}
                    task={task}
                    taskTypes={taskTypes}
                    onToggleCompletion={onToggleCompletion}
                    onClick={onTaskClick}
                  />
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

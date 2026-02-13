"use client";

import { cn } from "@/lib/utils";
import { ROADMAP_TASK_TYPES } from "@/lib/roadmap-utils";
import { GanttTaskRow } from "./GanttTaskRow";

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
  emoji: string;
  position: number;
  tasks: RoadmapTask[];
}

interface GanttPhaseGroupProps {
  phase: RoadmapPhase;
  totalColumns: number;
  startRow: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function GanttPhaseGroup({
  phase,
  totalColumns,
  startRow,
  isExpanded,
  onToggle,
}: GanttPhaseGroupProps) {
  const headerRow = startRow;
  const sortedTasks = [...phase.tasks].sort((a, b) => a.position - b.position);

  return (
    <>
      {/* Phase header row - column 1: phase name */}
      <div
        className="sticky left-0 z-10 flex cursor-pointer items-center gap-2 bg-[var(--c-gray)] px-3 py-2"
        style={{ gridRow: headerRow, gridColumn: "1 / 3" }}
        onClick={onToggle}
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
        <span className="text-sm">{phase.emoji}</span>
        <span className="truncate text-xs font-bold uppercase text-[var(--c-black)]">
          {phase.name}
        </span>
      </div>

      {/* Phase header - timeline background */}
      <div
        className="border-b-2 border-white/40 bg-[var(--c-gray)]"
        style={{
          gridRow: headerRow,
          gridColumn: `3 / ${totalColumns + 3}`,
        }}
      />

      {/* Task rows */}
      {isExpanded &&
        sortedTasks.map((task, taskIdx) => {
          const taskTypeInfo = ROADMAP_TASK_TYPES[task.taskType];
          const color = taskTypeInfo?.color ?? "#999";

          return (
            <GanttTaskRow
              key={task.id}
              task={task}
              totalColumns={totalColumns}
              taskTypeColor={color}
              rowIndex={headerRow + 1 + taskIdx}
            />
          );
        })}
    </>
  );
}

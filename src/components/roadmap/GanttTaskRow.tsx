"use client";

import { dateToColumn } from "@/lib/roadmap-utils";
import { GanttBar } from "./GanttBar";

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

interface GanttTaskRowProps {
  task: RoadmapTask;
  totalColumns: number;
  taskTypeColor: string;
  rowIndex: number;
}

export function GanttTaskRow({ task, totalColumns, taskTypeColor, rowIndex }: GanttTaskRowProps) {
  const startCol = dateToColumn(new Date(task.startDate));
  const endCol = dateToColumn(new Date(task.endDate));

  return (
    <>
      {/* Column 1: empty (phase name is rendered by GanttPhaseGroup) */}
      <div
        className="sticky left-0 z-10 bg-[var(--c-gray)]"
        style={{ gridRow: rowIndex, gridColumn: "1 / 2" }}
      />

      {/* Column 2: task name */}
      <div
        className="sticky left-[200px] z-10 flex items-center bg-[var(--c-gray)] px-3"
        style={{ gridRow: rowIndex, gridColumn: "2 / 3" }}
      >
        <span className="truncate text-xs font-bold uppercase text-[var(--c-black)]">
          {task.name}
        </span>
      </div>

      {/* Timeline background - single cell spanning all time columns */}
      <div
        className="h-10 border-b border-white/20"
        style={{
          gridRow: rowIndex,
          gridColumn: `3 / ${totalColumns + 3}`,
        }}
      />

      {/* Gantt bar overlaid at the correct columns */}
      <GanttBar
        startCol={startCol}
        endCol={endCol}
        color={taskTypeColor}
        label={task.name}
        isCompleted={task.isCompleted}
        rowIndex={rowIndex}
      />
    </>
  );
}

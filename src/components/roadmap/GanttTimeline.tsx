"use client";

import type { TimeAxisConfig } from "@/lib/roadmap-utils";
import { GanttHeader } from "./GanttHeader";
import { GanttBar } from "./GanttBar";
import { GanttTodayMarker } from "./GanttTodayMarker";
import { getTodayColumn } from "@/lib/roadmap-utils";
import type { ZoomLevel } from "@/lib/roadmap-utils";

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

interface GanttTimelineProps {
  phases: RoadmapPhase[];
  timeAxis: TimeAxisConfig;
  zoom: ZoomLevel;
  expandedMap: Record<string, boolean>;
  taskTypes: TaskTypeInfo[];
  onTaskClick: (task: RoadmapTask) => void;
}

export function GanttTimeline({
  phases,
  timeAxis,
  zoom,
  expandedMap,
  taskTypes,
  onTaskClick,
}: GanttTimelineProps) {
  const todayCol = getTodayColumn(timeAxis);

  const taskTypeMap = new Map(taskTypes.map((t) => [t.key, t]));

  // Build flat list of rows for timeline
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);

  return (
    <div className="relative min-w-[600px] flex-1">
      {/* Header */}
      <GanttHeader columns={timeAxis.columns} yearSpans={timeAxis.yearSpans} zoom={zoom} />

      {/* Task rows */}
      <div className="relative">
        {/* Today marker */}
        <GanttTodayMarker columnIndex={todayCol} totalColumns={timeAxis.totalColumns} />

        {/* Grid lines background */}
        <div className="absolute inset-0 flex pointer-events-none">
          {timeAxis.columns.map((col) => (
            <div
              key={col.index}
              className="border-r border-white/30"
              style={{ width: `${100 / timeAxis.totalColumns}%` }}
            />
          ))}
        </div>

        {sortedPhases.map((phase) => {
          const isExpanded = expandedMap[phase.id] ?? true;
          const sortedTasks = [...phase.tasks].sort((a, b) => a.position - b.position);

          return (
            <div key={phase.id}>
              {/* Phase header row — empty in timeline (sidebar shows the name) */}
              <div className="h-10 border-b-2 border-white/40" />

              {/* Task rows */}
              {isExpanded &&
                sortedTasks.map((task) => {
                  const startCol = timeAxis.dateToColumn(new Date(task.startDate));
                  const endCol = timeAxis.dateToColumn(new Date(task.endDate));
                  const typeInfo = taskTypeMap.get(task.taskType);
                  const color = typeInfo?.color ?? "#999";

                  return (
                    <div key={task.id} className="relative h-10 border-b border-white/20">
                      <GanttBar
                        startCol={startCol}
                        endCol={endCol}
                        totalColumns={timeAxis.totalColumns}
                        color={color}
                        label={task.name}
                        isCompleted={task.isCompleted}
                        onClick={() => onTaskClick(task)}
                      />
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

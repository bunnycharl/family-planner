"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TimeAxisConfig } from "@/lib/roadmap-utils";
import { computeBarTracks } from "@/lib/roadmap-utils";
import { GanttBar } from "./GanttBar";
import { GanttTodayMarker } from "./GanttTodayMarker";
import { getTodayColumn } from "@/lib/roadmap-utils";

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

interface GanttTimelineProps {
  phases: RoadmapPhase[];
  timeAxis: TimeAxisConfig;
  selectedYear: number;
  expandedMap: Record<string, boolean>;
  onTaskClick: (task: RoadmapTask) => void;
}

export function GanttTimeline({
  phases,
  timeAxis,
  selectedYear,
  expandedMap,
  onTaskClick,
}: GanttTimelineProps) {
  const todayCol = getTodayColumn(timeAxis);
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);

  // Filter tasks that are visible in the selected year and compute tracks per phase
  const phaseData = useMemo(() => {
    return sortedPhases.map((phase) => {
      const visibleTasks = phase.tasks.filter((t) => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        return start.getFullYear() <= selectedYear && end.getFullYear() >= selectedYear;
      });
      const trackMap = computeBarTracks(visibleTasks);
      const maxTrack = visibleTasks.length > 0 ? Math.max(...Array.from(trackMap.values())) : 0;
      const rowHeight = visibleTasks.length > 0 ? (maxTrack + 1) * 40 : 40;
      return { phase, visibleTasks, trackMap, rowHeight };
    });
  }, [sortedPhases, selectedYear]);

  return (
    <div className="relative min-w-[600px] flex-1">
      {/* Task rows */}
      <div className="relative">
        {/* Today marker */}
        <GanttTodayMarker columnIndex={todayCol} totalColumns={timeAxis.totalColumns} />

        {/* Grid lines background */}
        <div className="absolute inset-0 flex pointer-events-none">
          {timeAxis.columns.map((col) => (
            <div
              key={col.index}
              className={cn(
                "border-r-2 last:border-r-0 transition-colors duration-200",
                col.isCurrentPeriod
                  ? "border-[var(--c-lavender)]/40 bg-[var(--c-lavender)]/5"
                  : "border-white/50"
              )}
              style={{ width: `${100 / timeAxis.totalColumns}%` }}
            />
          ))}
        </div>

        {phaseData.map(({ phase, visibleTasks, trackMap, rowHeight }) => {
          const isExpanded = expandedMap[phase.id] ?? true;

          return (
            <div key={phase.id}>
              {/* Phase header row */}
              <div className="h-12 border-b-2 border-white/60 bg-white/10" />

              {/* Task bars */}
              {isExpanded && (
                <div
                  className="relative border-b-2 border-white/40 bg-white/5"
                  style={{ height: rowHeight }}
                >
                  {visibleTasks.map((task) => {
                    const startCol = timeAxis.dateToColumn(new Date(task.startDate));
                    const endCol = timeAxis.dateToColumn(new Date(task.endDate));
                    const color = task.category?.color ?? "#999";
                    const track = trackMap.get(task.id) ?? 0;

                    return (
                      <GanttBar
                        key={task.id}
                        startCol={startCol}
                        endCol={endCol}
                        totalColumns={timeAxis.totalColumns}
                        color={color}
                        label={task.title}
                        isCompleted={task.status === "DONE"}
                        onClick={() => onTaskClick(task)}
                        style={{ top: `${track * 40 + 4}px`, height: "32px" }}
                        task={{
                          id: task.id,
                          title: task.title,
                          description: task.description,
                          startDate: task.startDate,
                          endDate: task.endDate,
                          category: task.category
                            ? { name: task.category.name, color: task.category.color }
                            : null,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

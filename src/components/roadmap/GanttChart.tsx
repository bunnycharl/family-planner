"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { computeTimeAxis, getTodayColumn } from "@/lib/roadmap-utils";
import type { ZoomLevel } from "@/lib/roadmap-utils";
import { GanttSidebar } from "./GanttSidebar";
import { GanttTimeline } from "./GanttTimeline";

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

interface GanttChartProps {
  phases: RoadmapPhase[];
  zoom: ZoomLevel;
  taskTypes: TaskTypeInfo[];
  onTaskClick: (task: RoadmapTask) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
  onToggleCompletion: (task: RoadmapTask) => void;
}

export function GanttChart({
  phases,
  zoom,
  taskTypes,
  onTaskClick,
  onEditPhase,
  onToggleCompletion,
}: GanttChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Expand/collapse state
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    phases.forEach((p) => {
      map[p.id] = true;
    });
    return map;
  });

  const togglePhase = (phaseId: string) => {
    setExpandedMap((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  // Collect all tasks for time axis computation
  const allTasks = useMemo(() => phases.flatMap((p) => p.tasks), [phases]);

  // Compute time axis
  const timeAxis = useMemo(() => computeTimeAxis(allTasks, zoom), [allTasks, zoom]);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const todayCol = getTodayColumn(timeAxis);
    if (todayCol < 0) return;

    const container = scrollRef.current;
    const sidebarWidth = 340;
    const timelineWidth = container.scrollWidth - sidebarWidth;
    const colWidth = timelineWidth / timeAxis.totalColumns;
    const targetScroll = todayCol * colWidth - container.clientWidth / 3;

    container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
  }, [timeAxis]);

  return (
    <div ref={scrollRef} className="overflow-x-auto rounded-3xl bg-[var(--c-gray)] p-4">
      <div className="flex">
        <GanttSidebar
          phases={phases}
          expandedMap={expandedMap}
          onTogglePhase={togglePhase}
          onEditPhase={onEditPhase}
          onToggleCompletion={onToggleCompletion}
          zoom={zoom}
        />
        <GanttTimeline
          phases={phases}
          timeAxis={timeAxis}
          zoom={zoom}
          expandedMap={expandedMap}
          taskTypes={taskTypes}
          onTaskClick={onTaskClick}
        />
      </div>
    </div>
  );
}

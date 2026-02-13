"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { computeTimeAxis, getTodayColumn } from "@/lib/roadmap-utils";
import { GanttSidebar } from "./GanttSidebar";
import { GanttTimeline } from "./GanttTimeline";
import { GanttHeader } from "./GanttHeader";
import type { RoadmapPhase, RoadmapTask } from "@/hooks/useRoadmap";

interface GanttChartProps {
  phases: RoadmapPhase[];
  year: number;
  onTaskClick: (task: RoadmapTask) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
  onToggleCompletion: (task: RoadmapTask) => void;
}

export function GanttChart({
  phases,
  year,
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

  // Compute time axis for the selected year
  const timeAxis = useMemo(() => computeTimeAxis(year), [year]);

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
    <div ref={scrollRef} className="overflow-x-auto rounded-3xl bg-[var(--c-gray)] p-6 shadow-xl">
      {/* Header section */}
      <div className="flex mb-5">
        {/* Empty space for sidebar */}
        <div className="w-[340px] shrink-0" />
        {/* Timeline header */}
        <div className="flex-1">
          <GanttHeader columns={timeAxis.columns} yearSpans={timeAxis.yearSpans} />
        </div>
      </div>

      {/* Content section */}
      <div className="flex rounded-2xl overflow-hidden shadow-lg">
        <GanttSidebar
          phases={phases}
          expandedMap={expandedMap}
          onTogglePhase={togglePhase}
          onEditPhase={onEditPhase}
          onToggleCompletion={onToggleCompletion}
          selectedYear={year}
        />
        <GanttTimeline
          phases={phases}
          timeAxis={timeAxis}
          selectedYear={year}
          expandedMap={expandedMap}
          onTaskClick={onTaskClick}
        />
      </div>
    </div>
  );
}

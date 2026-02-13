"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { computeTimeAxis, getTodayColumn } from "@/lib/roadmap-utils";
import type { ZoomLevel } from "@/lib/roadmap-utils";
import { GanttSidebar } from "./GanttSidebar";
import { GanttTimeline } from "./GanttTimeline";

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

interface GanttChartProps {
  phases: RoadmapPhase[];
  zoom: ZoomLevel;
  onMilestoneClick: (milestone: Milestone) => void;
  onEditPhase: (phase: RoadmapPhase) => void;
  onToggleCompletion: (milestone: Milestone) => void;
}

export function GanttChart({
  phases,
  zoom,
  onMilestoneClick,
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

  // Collect all milestones for time axis computation
  const allMilestones = useMemo(() => phases.flatMap((p) => p.milestones), [phases]);

  // Compute time axis
  const timeAxis = useMemo(() => computeTimeAxis(allMilestones, zoom), [allMilestones, zoom]);

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
          onMilestoneClick={onMilestoneClick}
        />
      </div>
    </div>
  );
}

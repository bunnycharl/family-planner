"use client";

import type { TimeAxisConfig } from "@/lib/roadmap-utils";
import { GanttHeader } from "./GanttHeader";
import { GanttBar } from "./GanttBar";
import { GanttTodayMarker } from "./GanttTodayMarker";
import { getTodayColumn } from "@/lib/roadmap-utils";
import type { ZoomLevel } from "@/lib/roadmap-utils";

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

interface GanttTimelineProps {
  phases: RoadmapPhase[];
  timeAxis: TimeAxisConfig;
  zoom: ZoomLevel;
  expandedMap: Record<string, boolean>;
  onMilestoneClick: (milestone: Milestone) => void;
}

export function GanttTimeline({
  phases,
  timeAxis,
  zoom,
  expandedMap,
  onMilestoneClick,
}: GanttTimelineProps) {
  const todayCol = getTodayColumn(timeAxis);

  // Build flat list of rows for timeline
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);

  return (
    <div className="relative min-w-[600px] flex-1">
      {/* Header */}
      <GanttHeader columns={timeAxis.columns} yearSpans={timeAxis.yearSpans} zoom={zoom} />

      {/* Milestone rows */}
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
          const sortedMilestones = [...phase.milestones].sort((a, b) => a.position - b.position);

          return (
            <div key={phase.id}>
              {/* Phase header row — empty in timeline (sidebar shows the name) */}
              <div className="h-10 border-b-2 border-white/40" />

              {/* Milestone rows */}
              {isExpanded &&
                sortedMilestones.map((milestone) => {
                  const startCol = timeAxis.dateToColumn(new Date(milestone.startDate));
                  const endCol = timeAxis.dateToColumn(new Date(milestone.endDate));
                  const color = milestone.category?.color ?? "#999";

                  return (
                    <div key={milestone.id} className="relative h-10 border-b border-white/20">
                      <GanttBar
                        startCol={startCol}
                        endCol={endCol}
                        totalColumns={timeAxis.totalColumns}
                        color={color}
                        label={milestone.name}
                        isCompleted={milestone.isCompleted}
                        onClick={() => onMilestoneClick(milestone)}
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

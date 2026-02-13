"use client";

import { useState, useMemo } from "react";
import { getColumnCount } from "@/lib/roadmap-utils";
import { GanttHeader } from "./GanttHeader";
import { GanttPhaseGroup } from "./GanttPhaseGroup";
import { GanttTodayMarker } from "./GanttTodayMarker";

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

interface GanttChartProps {
  phases: RoadmapPhase[];
}

export function GanttChart({ phases }: GanttChartProps) {
  const totalColumns = getColumnCount();

  // Lift expanded state for all phases so we can compute row indices
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

  const sortedPhases = useMemo(() => [...phases].sort((a, b) => a.position - b.position), [phases]);

  // Compute start row for each phase and total rows
  // Header occupies rows 1-2
  const HEADER_ROWS = 2;

  const phaseLayout = useMemo(() => {
    const layout: Array<{ phase: RoadmapPhase; startRow: number }> = [];
    let currentRow = HEADER_ROWS + 1; // start at row 3

    for (const phase of sortedPhases) {
      layout.push({ phase, startRow: currentRow });
      const isExpanded = expandedMap[phase.id] ?? true;
      // 1 for the phase header + task rows (if expanded)
      currentRow += 1 + (isExpanded ? phase.tasks.length : 0);
    }

    return layout;
  }, [sortedPhases, expandedMap]);

  // Total grid rows = header rows + all phase/task rows
  const totalRows = useMemo(() => {
    if (phaseLayout.length === 0) return HEADER_ROWS;
    const lastPhase = phaseLayout[phaseLayout.length - 1];
    const isExpanded = expandedMap[lastPhase.phase.id] ?? true;
    return lastPhase.startRow + (isExpanded ? lastPhase.phase.tasks.length : 0);
  }, [phaseLayout, expandedMap]);

  return (
    <div className="overflow-x-auto rounded-3xl bg-[var(--c-gray)] p-4">
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: `200px 160px repeat(${totalColumns}, minmax(32px, 1fr))`,
        }}
      >
        {/* Header */}
        <GanttHeader />

        {/* Phase groups */}
        {phaseLayout.map(({ phase, startRow }) => (
          <GanttPhaseGroup
            key={phase.id}
            phase={phase}
            totalColumns={totalColumns}
            startRow={startRow}
            isExpanded={expandedMap[phase.id] ?? true}
            onToggle={() => togglePhase(phase.id)}
          />
        ))}

        {/* Today marker */}
        <GanttTodayMarker totalRows={totalRows} />
      </div>
    </div>
  );
}

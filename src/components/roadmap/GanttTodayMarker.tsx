"use client";

import { dateToColumn } from "@/lib/roadmap-utils";

interface GanttTodayMarkerProps {
  totalRows: number;
}

export function GanttTodayMarker({ totalRows }: GanttTodayMarkerProps) {
  const today = new Date();
  const year = today.getFullYear();

  // Only render if today falls within the chart range (2026-2035)
  if (year < 2026 || year > 2035) {
    return null;
  }

  const col = dateToColumn(today);
  // Grid column offset: +3 for the 2 label columns and 1-based grid indexing
  const gridCol = col + 3;

  return (
    <div
      className="pointer-events-none z-20 flex justify-center"
      style={{
        gridColumn: `${gridCol} / ${gridCol + 1}`,
        gridRow: `1 / ${totalRows + 1}`,
      }}
    >
      <div className="h-full w-0 border-l-2 border-dashed border-[var(--c-coral)]" />
    </div>
  );
}

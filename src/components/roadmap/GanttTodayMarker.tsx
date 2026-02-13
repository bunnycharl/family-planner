"use client";

interface GanttTodayMarkerProps {
  columnIndex: number;
  totalColumns: number;
}

export function GanttTodayMarker({ columnIndex, totalColumns }: GanttTodayMarkerProps) {
  if (columnIndex < 0 || totalColumns === 0) return null;

  const leftPercent = ((columnIndex + 0.5) / totalColumns) * 100;

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 border-l-2 border-dashed border-[var(--c-coral)]"
      style={{ left: `${leftPercent}%` }}
    />
  );
}

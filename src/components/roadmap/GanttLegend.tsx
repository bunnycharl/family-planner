"use client";

import { ROADMAP_TASK_TYPES } from "@/lib/roadmap-utils";

export function GanttLegend() {
  const entries = Object.entries(ROADMAP_TASK_TYPES);

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, { label, color }]) => (
        <div
          key={key}
          className="flex items-center gap-1.5 rounded-full bg-[var(--c-gray)] px-3 py-1 text-xs font-bold"
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[var(--c-black)]">{label}</span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { TimeColumn, YearSpan } from "@/lib/roadmap-utils";

interface GanttHeaderProps {
  columns: TimeColumn[];
  yearSpans: YearSpan[];
}

export function GanttHeader({ columns, yearSpans }: GanttHeaderProps) {
  return (
    <>
      {/* Level 1: Year spans */}
      <div className="flex mb-2">
        {yearSpans.map((span) => (
          <div
            key={span.year}
            className="flex items-center justify-center pb-2 text-xl sm:text-2xl font-extrabold uppercase text-[var(--c-black)] bg-white rounded-xl py-2"
            style={{ width: `${(span.colSpan / columns.length) * 100}%` }}
          >
            {span.year}
          </div>
        ))}
      </div>

      {/* Level 2: Month columns */}
      <div className="flex border-b-2 border-white/50">
        {columns.map((col) => (
          <div
            key={col.index}
            className={cn(
              "flex items-center justify-center py-2.5 text-sm font-bold uppercase border-r-2 last:border-r-0",
              col.isCurrentPeriod
                ? "bg-[var(--c-lavender)] text-white"
                : "text-[var(--c-black)] bg-white/50 border-white/60"
            )}
            style={{ width: `${100 / columns.length}%` }}
          >
            {col.label}
          </div>
        ))}
      </div>
    </>
  );
}

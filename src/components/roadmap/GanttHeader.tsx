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
      <div className="flex gap-3 mb-4">
        {yearSpans.map((span) => (
          <div
            key={span.year}
            className="flex items-center justify-center text-3xl sm:text-4xl font-extrabold uppercase text-white bg-[var(--c-black)] rounded-3xl py-4 shadow-lg"
            style={{ width: `${(span.colSpan / columns.length) * 100}%` }}
          >
            {span.year}
          </div>
        ))}
      </div>

      {/* Level 2: Month columns */}
      <div className="flex gap-1 mb-3">
        {columns.map((col, idx) => (
          <div
            key={col.index}
            className={cn(
              "flex items-center justify-center py-3 text-sm font-bold uppercase transition-all duration-200",
              col.isCurrentPeriod
                ? "bg-[var(--c-lavender)] text-white shadow-md scale-105"
                : "text-[var(--c-black)] bg-white hover:bg-white/80",
              idx === 0 && "rounded-l-2xl",
              idx === columns.length - 1 && "rounded-r-2xl"
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

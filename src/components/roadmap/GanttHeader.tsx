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
      <div className="flex">
        {yearSpans.map((span) => (
          <div
            key={span.year}
            className="flex items-end justify-center pb-1 text-[10px] font-bold uppercase text-[#999]"
            style={{ width: `${(span.colSpan / columns.length) * 100}%` }}
          >
            {span.year}
          </div>
        ))}
      </div>

      {/* Level 2: Month columns */}
      <div className="flex">
        {columns.map((col) => (
          <div
            key={col.index}
            className={cn(
              "flex items-center justify-center py-1.5 text-[10px] font-bold uppercase text-[#999]",
              col.isCurrentPeriod && "rounded-lg bg-[var(--c-lavender)]/20 text-[var(--c-black)]"
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

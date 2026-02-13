"use client";

import { cn } from "@/lib/utils";
import { getTimeColumns, getYearSpans } from "@/lib/roadmap-utils";

export function GanttHeader() {
  const yearSpans = getYearSpans();
  const timeColumns = getTimeColumns();

  return (
    <>
      {/* Level 1: Year spans (row 1) */}

      {/* Phase label column placeholder */}
      <div
        className="sticky left-0 z-10 bg-[var(--c-gray)]"
        style={{ gridRow: 1, gridColumn: "1 / 2" }}
      />
      {/* Task label column placeholder */}
      <div
        className="sticky left-[200px] z-10 bg-[var(--c-gray)]"
        style={{ gridRow: 1, gridColumn: "2 / 3" }}
      />
      {/* Year headers */}
      {yearSpans.map((span) => (
        <div
          key={span.year}
          className="flex items-end justify-center pb-1 text-[10px] font-bold uppercase text-[#999]"
          style={{
            gridRow: 1,
            gridColumn: `${span.colStart + 3} / ${span.colStart + 3 + span.colSpan}`,
          }}
        >
          {span.year}
        </div>
      ))}

      {/* Level 2: Period columns (row 2) */}

      {/* Phase label */}
      <div
        className="sticky left-0 z-10 flex items-center bg-[var(--c-gray)] px-3 pb-2 text-[10px] font-bold uppercase text-[#999]"
        style={{ gridRow: 2, gridColumn: "1 / 2" }}
      >
        Фаза
      </div>
      {/* Task label */}
      <div
        className="sticky left-[200px] z-10 flex items-center bg-[var(--c-gray)] px-3 pb-2 text-[10px] font-bold uppercase text-[#999]"
        style={{ gridRow: 2, gridColumn: "2 / 3" }}
      >
        Задача
      </div>
      {/* Period headers */}
      {timeColumns.map((col) => (
        <div
          key={col.index}
          className={cn(
            "flex items-center justify-center rounded-lg pb-2 text-[10px] font-bold uppercase text-[#999]",
            col.isCurrentPeriod && "bg-[var(--c-lavender)]/20 text-[var(--c-black)]"
          )}
          style={{
            gridRow: 2,
            gridColumn: `${col.index + 3} / ${col.index + 4}`,
          }}
        >
          {col.label}
        </div>
      ))}
    </>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface GanttBarProps {
  startCol: number;
  endCol: number;
  color: string;
  label: string;
  isCompleted: boolean;
  rowIndex: number;
}

export function GanttBar({ startCol, endCol, color, label, isCompleted, rowIndex }: GanttBarProps) {
  return (
    <div
      className={cn(
        "z-[5] flex h-8 items-center self-center rounded-full px-3 transition-opacity",
        isCompleted && "opacity-50"
      )}
      style={{
        gridRow: rowIndex,
        gridColumn: `${startCol + 3} / ${endCol + 4}`,
        backgroundColor: color,
      }}
    >
      <span className={cn("truncate text-xs font-bold text-white", isCompleted && "line-through")}>
        {label}
      </span>
    </div>
  );
}

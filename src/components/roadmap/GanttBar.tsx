"use client";

import { cn } from "@/lib/utils";

interface GanttBarProps {
  startCol: number;
  endCol: number;
  totalColumns: number;
  color: string;
  label: string;
  isCompleted: boolean;
  onClick?: () => void;
}

export function GanttBar({
  startCol,
  endCol,
  totalColumns,
  color,
  label,
  isCompleted,
  onClick,
}: GanttBarProps) {
  if (totalColumns === 0) return null;

  const leftPercent = (startCol / totalColumns) * 100;
  const widthPercent = ((endCol - startCol + 1) / totalColumns) * 100;

  return (
    <div
      className="absolute top-1 bottom-1 flex items-center"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex h-full w-full items-center rounded-full px-3 transition-all cursor-pointer",
          "hover:shadow-md hover:brightness-110",
          isCompleted && "opacity-50"
        )}
        style={{ backgroundColor: color }}
      >
        <span
          className={cn("truncate text-xs font-bold text-white", isCompleted && "line-through")}
        >
          {label}
        </span>
      </button>
    </div>
  );
}

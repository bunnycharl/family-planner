"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface GanttBarTask {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  category: { name: string; color: string } | null;
}

interface GanttBarProps {
  startCol: number;
  endCol: number;
  totalColumns: number;
  color: string;
  label: string;
  isCompleted: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  task?: GanttBarTask;
}

export function GanttBar({
  startCol,
  endCol,
  totalColumns,
  color,
  label,
  isCompleted,
  onClick,
  style,
  task,
}: GanttBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (totalColumns === 0) return null;

  const leftPercent = (startCol / totalColumns) * 100;
  const widthPercent = ((endCol - startCol + 1) / totalColumns) * 100;

  return (
    <div
      className="absolute top-1 bottom-1 flex items-center"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        ...style,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex h-full w-full items-center rounded-full px-3 transition-all cursor-pointer",
          "hover:shadow-md hover:brightness-110",
          isCompleted && "opacity-50"
        )}
        style={{
          backgroundColor: color,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        <span
          className={cn("truncate text-xs font-bold text-white", isCompleted && "line-through")}
        >
          {label}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && task && (
        <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 z-50 pointer-events-none w-56">
          <div className="rounded-2xl bg-white shadow-xl border border-[var(--c-gray)] p-3 text-left">
            <p className="text-xs font-bold uppercase text-[var(--c-black)] mb-1">{task.title}</p>
            {task.description && (
              <p className="text-[10px] text-[#666] mb-1 line-clamp-2">{task.description}</p>
            )}
            <p className="text-[10px] text-[#999]">
              {format(new Date(task.startDate), "d MMM yyyy", { locale: ru })} &ndash;{" "}
              {format(new Date(task.endDate), "d MMM yyyy", { locale: ru })}
            </p>
            {task.category && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                <span className="text-[10px] font-bold text-[#999] uppercase">
                  {task.category.name}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

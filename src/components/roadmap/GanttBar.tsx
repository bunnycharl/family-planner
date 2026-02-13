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
          "flex h-full w-full items-center rounded-2xl px-4 transition-all duration-200 cursor-pointer border-2 border-transparent",
          "hover:shadow-lg hover:scale-105 hover:border-white/30",
          isCompleted && "opacity-60"
        )}
        style={{
          backgroundColor: color,
        }}
      >
        <span
          className={cn(
            "truncate text-xs font-extrabold text-white uppercase tracking-wide",
            isCompleted && "line-through"
          )}
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {label}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && task && (
        <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-3 z-50 pointer-events-none w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="rounded-3xl bg-white shadow-2xl border-2 border-[var(--c-gray)] p-4 text-left">
            <p className="text-sm font-extrabold uppercase text-[var(--c-black)] mb-2 tracking-tight">
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-[#666] mb-2 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-[#999] font-bold mb-2">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {format(new Date(task.startDate), "d MMM yyyy", { locale: ru })} &ndash;{" "}
                {format(new Date(task.endDate), "d MMM yyyy", { locale: ru })}
              </span>
            </div>
            {task.category && (
              <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-[var(--c-gray)] rounded-xl">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: task.category.color }}
                />
                <span className="text-xs font-extrabold text-[var(--c-black)] uppercase tracking-wide">
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

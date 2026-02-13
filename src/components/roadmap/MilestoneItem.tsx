"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Milestone {
  id: string;
  name: string;
  details: string | null;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  position: number;
  phaseId: string;
}

interface MilestoneItemProps {
  milestone: Milestone;
  onToggleCompletion: (milestone: Milestone) => void;
  onClick: (milestone: Milestone) => void;
}

export function MilestoneItem({ milestone, onToggleCompletion, onClick }: MilestoneItemProps) {
  const color = milestone.category?.color;
  const startFormatted = format(new Date(milestone.startDate), "dd.MM", { locale: ru });
  const endFormatted = format(new Date(milestone.endDate), "dd.MM.yy", { locale: ru });

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-white/30 cursor-pointer hover:bg-white/20 transition-colors"
      onClick={() => onClick(milestone)}
    >
      {/* Completion checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompletion(milestone);
        }}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all cursor-pointer",
          milestone.isCompleted
            ? "border-[var(--c-mint)] bg-[var(--c-mint)]"
            : "border-[#ccc] hover:border-[var(--c-mint)]"
        )}
      >
        {milestone.isCompleted && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Color dot */}
      {color && (
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      )}

      {/* Name & dates */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-bold text-[var(--c-black)] truncate",
            milestone.isCompleted && "line-through opacity-50"
          )}
        >
          {milestone.name}
        </div>
        <div className="text-[10px] font-bold text-[#999] mt-0.5">
          {startFormatted} &mdash; {endFormatted}
        </div>
      </div>

      {/* Arrow */}
      <svg
        className="h-4 w-4 shrink-0 text-[#ccc]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

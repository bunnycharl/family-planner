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

interface MilestoneDetailSheetProps {
  milestone: Milestone | null;
  onClose: () => void;
  onEdit: (milestone: Milestone) => void;
  onToggleCompletion: (milestone: Milestone) => void;
}

export function MilestoneDetailSheet({
  milestone,
  onClose,
  onEdit,
  onToggleCompletion,
}: MilestoneDetailSheetProps) {
  if (!milestone) return null;

  const categoryName = milestone.category?.name;
  const categoryColor = milestone.category?.color;
  const startFormatted = format(new Date(milestone.startDate), "d MMM yyyy", { locale: ru });
  const endFormatted = format(new Date(milestone.endDate), "d MMM yyyy", { locale: ru });

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div
        className={cn(
          "absolute z-10 bg-white flex flex-col",
          // Mobile: slide-up from bottom
          "inset-x-0 bottom-0 rounded-t-3xl max-h-[70vh]",
          // Desktop: centered
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:max-w-md md:w-full md:rounded-3xl md:shadow-xl"
        )}
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-[#ddd]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-2">
          <div className="flex-1">
            <h3 className="text-base font-extrabold uppercase text-[var(--c-black)]">
              {milestone.name}
            </h3>
            {categoryName && categoryColor && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: categoryColor }} />
                <span className="text-xs font-bold text-[#999]">{categoryName}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-[var(--c-gray)] hover:text-[var(--c-black)] transition-all cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
          {/* Date range */}
          <div className="flex items-center gap-2 text-sm text-[#666]">
            <svg
              className="h-4 w-4 text-[#999]"
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
            <span className="font-bold">{startFormatted}</span>
            <span className="text-[#999]">&mdash;</span>
            <span className="font-bold">{endFormatted}</span>
          </div>

          {/* Details */}
          {milestone.details && (
            <p className="text-sm text-[#666] leading-relaxed">{milestone.details}</p>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold uppercase",
                milestone.isCompleted
                  ? "bg-[var(--c-mint)]/20 text-[var(--c-mint)]"
                  : "bg-[var(--c-gray)] text-[#999]"
              )}
            >
              {milestone.isCompleted ? "Выполнено" : "В процессе"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 pb-6 md:pb-4">
          <button
            type="button"
            onClick={() => onToggleCompletion(milestone)}
            className={cn(
              "rounded-full border-2 px-4 py-2.5 text-sm font-bold uppercase transition-all cursor-pointer",
              milestone.isCompleted
                ? "border-[#ccc] text-[#999] hover:bg-[var(--c-gray)]"
                : "border-[var(--c-mint)] text-[var(--c-mint)] hover:bg-[var(--c-mint)]/10"
            )}
          >
            {milestone.isCompleted ? "Вернуть" : "Выполнено"}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(milestone);
            }}
            className="flex-1 rounded-full bg-[var(--c-black)] px-6 py-2.5 text-sm font-bold uppercase text-white hover:opacity-80 transition-all cursor-pointer"
          >
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
}

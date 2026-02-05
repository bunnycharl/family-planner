"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type ViewMode = "day" | "month" | "year";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_LABELS: Record<ViewMode, string> = {
  day: "День",
  month: "Месяц",
  year: "Год",
};

function getDateLabel(date: Date, viewMode: ViewMode): string {
  switch (viewMode) {
    case "day":
      return format(date, "d MMMM yyyy", { locale: ru });
    case "month":
      return format(date, "LLLL yyyy", { locale: ru });
    case "year":
      return format(date, "yyyy");
  }
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
}: CalendarHeaderProps) {
  function navigate(direction: -1 | 1) {
    const d = new Date(currentDate);
    switch (viewMode) {
      case "day":
        d.setDate(d.getDate() + direction);
        break;
      case "month":
        d.setMonth(d.getMonth() + direction);
        break;
      case "year":
        d.setFullYear(d.getFullYear() + direction);
        break;
    }
    onDateChange(d);
  }

  function goToToday() {
    onDateChange(new Date());
  }

  const modes: ViewMode[] = ["day", "month", "year"];

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[var(--color-bg)] rounded-xl p-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg",
              "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]",
              "transition-all cursor-pointer"
            )}
            aria-label="Назад"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => navigate(1)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg",
              "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]",
              "transition-all cursor-pointer"
            )}
            aria-label="Вперёд"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className={cn(
            "rounded-xl border-2 border-[var(--color-primary)] px-4 py-2 text-sm font-semibold",
            "text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
            "transition-all cursor-pointer"
          )}
        >
          Сегодня
        </button>

        <h2 className="ml-2 text-lg font-bold capitalize text-[var(--color-text)] sm:text-xl">
          {getDateLabel(currentDate, viewMode)}
        </h2>
      </div>

      {/* Right: view mode tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--color-bg)] p-1">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer",
              viewMode === mode
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            )}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}

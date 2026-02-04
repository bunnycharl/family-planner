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
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
          aria-label="Назад"
        >
          <svg
            className="h-4 w-4"
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
          aria-label="Вперёд"
        >
          <svg
            className="h-4 w-4"
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

        <button
          type="button"
          onClick={goToToday}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Сегодня
        </button>

        <h2 className="ml-2 text-base font-semibold capitalize text-gray-900 sm:text-lg">
          {getDateLabel(currentDate, viewMode)}
        </h2>
      </div>

      {/* Right: view mode tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
              viewMode === mode
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}

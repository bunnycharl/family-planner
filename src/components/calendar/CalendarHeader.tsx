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
    <div className="flex flex-col gap-3 p-4 md:px-8 md:pt-8 sm:flex-row sm:items-center sm:justify-between bg-white">
      {/* Left: navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-black)] text-white hover:scale-105 transition-transform cursor-pointer"
            aria-label="Назад"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-black)] text-white hover:scale-105 transition-transform cursor-pointer"
            aria-label="Вперёд"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="rounded-full border-2 border-[var(--c-black)] px-5 py-2 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)] hover:text-white transition-all cursor-pointer"
        >
          Сегодня
        </button>

        <h2 className="ml-2 text-xl font-extrabold capitalize tracking-tight sm:text-2xl">
          {getDateLabel(currentDate, viewMode)}
        </h2>
      </div>

      {/* Right: view mode tabs */}
      <div className="flex items-center gap-1 rounded-full bg-[var(--c-gray)] p-1">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-bold uppercase transition-all cursor-pointer",
              viewMode === mode
                ? "bg-[var(--c-black)] text-white"
                : "text-[var(--c-black)] hover:bg-white"
            )}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}

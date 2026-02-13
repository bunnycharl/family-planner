"use client";

import {
  startOfYear,
  eachMonthOfInterval,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/types/calendar";

interface YearViewProps {
  currentDate: Date;
  events: CalendarItem[];
  onMonthClick: (date: Date) => void;
}

const DAY_NAMES_SHORT = ["П", "В", "С", "Ч", "П", "С", "В"];

const MONTH_COLORS = [
  "var(--c-coral)",
  "var(--c-mint)",
  "var(--c-lavender)",
  "var(--c-yellow)",
  "var(--c-coral)",
  "var(--c-mint)",
  "var(--c-lavender)",
  "var(--c-yellow)",
  "var(--c-coral)",
  "var(--c-mint)",
  "var(--c-lavender)",
  "var(--c-yellow)",
];

export function YearView({ currentDate, events, onMonthClick }: YearViewProps) {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const eventDateSet = new Set<string>();
  const eventColorMap = new Map<string, string>();

  events.forEach((event) => {
    const dateKey = format(parseISO(event.date), "yyyy-MM-dd");
    eventDateSet.add(dateKey);
    if (event.category?.color) {
      eventColorMap.set(dateKey, event.category.color);
    }
  });

  const now = new Date();

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
      {months.map((month, monthIdx) => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: calStart, end: calEnd });
        const isCurrentMonth = isSameMonth(month, now);

        return (
          <button
            key={month.toISOString()}
            type="button"
            onClick={() => onMonthClick(month)}
            className={cn(
              "rounded-3xl p-4 text-left transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer",
              isCurrentMonth ? "text-white" : "bg-[var(--c-gray)] text-[var(--c-black)]"
            )}
            style={isCurrentMonth ? { backgroundColor: MONTH_COLORS[monthIdx] } : undefined}
          >
            {/* Month name */}
            <div className="mb-3 text-base sm:text-lg font-extrabold uppercase">
              {format(month, "LLLL", { locale: ru })}
            </div>

            {/* Mini day headers */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES_SHORT.map((name, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-center text-[10px] sm:text-xs font-bold leading-5",
                    isCurrentMonth ? "text-white/60" : "text-[#999]"
                  )}
                >
                  {name}
                </div>
              ))}

              {days.map((day) => {
                const inMonth = isSameMonth(day, month);
                const today = isToday(day);
                const dateKey = format(day, "yyyy-MM-dd");
                const hasEvent = eventDateSet.has(dateKey);
                const dotColor = eventColorMap.get(dateKey);

                return (
                  <div
                    key={day.toISOString()}
                    className="relative flex items-center justify-center py-1"
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs leading-none font-bold",
                        !inMonth && "text-transparent",
                        inMonth && !isCurrentMonth && "text-[var(--c-black)]",
                        inMonth && isCurrentMonth && "text-white",
                        today && inMonth && "bg-[var(--c-black)] text-white ring-2 ring-white/50"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {hasEvent && inMonth && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                        style={{ backgroundColor: isCurrentMonth ? "#fff" : (dotColor ?? "#000") }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

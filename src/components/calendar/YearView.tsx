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
  isSameDay,
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

export function YearView({ currentDate, events, onMonthClick }: YearViewProps) {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Pre-compute a set of date strings that have events for fast lookup
  const eventDateSet = new Set<string>();
  const eventColorMap = new Map<string, string>();

  events.forEach((event) => {
    const dateKey = format(parseISO(event.startDate), "yyyy-MM-dd");
    eventDateSet.add(dateKey);
    if (event.category?.color) {
      eventColorMap.set(dateKey, event.category.color);
    }
  });

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {months.map((month) => {
        const mStart = startOfMonth(month);
        const mEnd = endOfMonth(month);
        const calStart = startOfWeek(mStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: calStart, end: calEnd });

        return (
          <button
            key={month.toISOString()}
            type="button"
            onClick={() => onMonthClick(month)}
            className="rounded-lg border p-2 text-left transition-colors hover:bg-gray-50 hover:border-indigo-300"
          >
            {/* Month name */}
            <div className="mb-1 text-sm font-semibold capitalize text-gray-900">
              {format(month, "LLLL", { locale: ru })}
            </div>

            {/* Mini day headers */}
            <div className="grid grid-cols-7 gap-0">
              {DAY_NAMES_SHORT.map((name, i) => (
                <div
                  key={i}
                  className="text-center text-[9px] text-gray-400 leading-4"
                >
                  {name}
                </div>
              ))}

              {/* Day cells */}
              {days.map((day) => {
                const inMonth = isSameMonth(day, month);
                const today = isToday(day);
                const dateKey = format(day, "yyyy-MM-dd");
                const hasEvent = eventDateSet.has(dateKey);
                const dotColor = eventColorMap.get(dateKey);

                return (
                  <div
                    key={day.toISOString()}
                    className="relative flex items-center justify-center"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[9px] leading-none",
                        !inMonth && "text-transparent",
                        inMonth && "text-gray-700",
                        today && inMonth && "bg-indigo-100 font-bold text-indigo-700"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {hasEvent && inMonth && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                        style={{ backgroundColor: dotColor ?? "#6366f1" }}
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

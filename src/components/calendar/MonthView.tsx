"use client";

import {
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
import { cn } from "@/lib/utils";
import { EventChip } from "./EventChip";
import type { CalendarItem } from "@/types/calendar";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarItem[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarItem) => void;
}

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const MAX_VISIBLE_EVENTS = 2;

export function MonthView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getEventsForDay(day: Date): CalendarItem[] {
    return events.filter((event) => {
      const eventStart = parseISO(event.startDate);
      return isSameDay(eventStart, day);
    });
  }

  return (
    <div className="flex flex-col px-2 sm:px-4 pb-4">
      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((name, idx) => (
          <div
            key={name}
            className={cn(
              "py-3 text-center text-xs font-semibold uppercase tracking-wider",
              idx >= 5
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)]"
            )}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 gap-1">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const inCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const extraCount = dayEvents.length - MAX_VISIBLE_EVENTS;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={cn(
                "min-h-[80px] cursor-pointer rounded-xl p-2 transition-all sm:min-h-[100px]",
                "hover:bg-[var(--color-primary-50)] hover:ring-1 hover:ring-[var(--color-primary)]/20",
                !inCurrentMonth && "opacity-40",
                inCurrentMonth && "bg-[var(--color-bg-card)]",
                today && "ring-2 ring-[var(--color-primary)] bg-[var(--color-primary-50)]"
              )}
            >
              <div
                className={cn(
                  "mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold",
                  today && "bg-[var(--color-primary)] text-white",
                  !today && inCurrentMonth && "text-[var(--color-text)]",
                  !inCurrentMonth && "text-[var(--color-text-muted)]"
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))}
                {extraCount > 0 && (
                  <div className="px-1 text-xs font-medium text-[var(--color-primary)]">
                    +{extraCount} ещё
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

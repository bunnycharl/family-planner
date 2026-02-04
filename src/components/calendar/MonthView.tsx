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
    <div className="flex flex-col px-2 sm:px-4">
      {/* Day name headers */}
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-xs font-medium text-gray-500"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 border-t border-l">
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
                "min-h-[80px] cursor-pointer border-b border-r p-1 transition-colors hover:bg-gray-50 sm:min-h-[100px] sm:p-2",
                !inCurrentMonth && "bg-gray-50/50"
              )}
            >
              <div
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:text-sm",
                  today && "ring-2 ring-indigo-500 bg-indigo-50 text-indigo-700",
                  !inCurrentMonth && "text-gray-300",
                  inCurrentMonth && !today && "text-gray-900"
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))}
                {extraCount > 0 && (
                  <div className="px-1 text-xs text-gray-500">
                    +{extraCount}
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

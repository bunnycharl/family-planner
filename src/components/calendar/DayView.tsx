"use client";

import { useRef, useCallback } from "react";
import { format, isSameDay, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import type { CalendarItem } from "@/types/calendar";

interface DayViewProps {
  currentDate: Date;
  events: CalendarItem[];
  onEventClick: (event: CalendarItem) => void;
  onDateChange: (date: Date) => void;
}

export function DayView({ currentDate, events, onEventClick, onDateChange }: DayViewProps) {
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.startDate), currentDate)
  );

  // Sort: tasks first, then events; within each group by title
  const sorted = [...dayEvents].sort((a, b) => {
    if (a.itemType !== b.itemType) {
      return a.itemType === "task" ? 1 : -1;
    }
    return a.title.localeCompare(b.title);
  });

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current) return;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchRef.current.startX;
      const diffY = touch.clientY - touchRef.current.startY;

      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          onDateChange(addDays(currentDate, 1));
        } else {
          onDateChange(addDays(currentDate, -1));
        }
      }
      touchRef.current = null;
    },
    [currentDate, onDateChange]
  );

  return (
    <div
      className="flex flex-col px-2 sm:px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Date header */}
      <h3 className="py-3 text-lg font-semibold capitalize text-gray-900">
        {format(currentDate, "EEEE, d MMMM yyyy", { locale: ru })}
      </h3>

      {/* Items list */}
      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((item) => {
            const isTask = item.itemType === "task";

            return (
              <button
                key={`${item.itemType}-${item.id}`}
                type="button"
                onClick={() => onEventClick(item)}
                className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-gray-50"
                style={{
                  borderLeftWidth: 4,
                  borderLeftStyle: isTask ? "dashed" : "solid",
                  borderLeftColor: item.category?.color ?? "#9ca3af",
                }}
              >
                {/* Checkbox for tasks */}
                {isTask && (
                  <span className="text-base text-gray-400 shrink-0">
                    {item.taskStatus === "DONE" ? "\u2611" : "\u2610"}
                  </span>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {item.title}
                  </div>
                  {/* Category badge */}
                  {item.category && (
                    <div className="mt-0.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: item.category.color }}
                      >
                        {item.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                {item.createdBy && (
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: item.createdBy.avatarColor }}
                  >
                    {item.createdBy.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            className="mb-2 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Нет событий на этот день</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useCallback } from "react";
import { format, isSameDay, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import type { CalendarItem } from "@/types/calendar";

const CARD_COLORS = ["var(--c-coral)", "var(--c-mint)", "var(--c-lavender)", "var(--c-yellow)"];

interface DayViewProps {
  currentDate: Date;
  events: CalendarItem[];
  onEventClick: (event: CalendarItem) => void;
  onDateChange: (date: Date) => void;
}

export function DayView({ currentDate, events, onEventClick, onDateChange }: DayViewProps) {
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const dayEvents = events.filter((event) => isSameDay(new Date(event.startDate), currentDate));

  const sorted = [...dayEvents].sort((a, b) => {
    if (a.itemType !== b.itemType) {
      return a.itemType === "task" ? 1 : -1;
    }
    return a.title.localeCompare(b.title);
  });

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
      className="flex flex-col px-2 sm:px-4 h-full min-h-[calc(100vh-200px)]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Date header */}
      <h3 className="py-3 text-lg font-extrabold uppercase">
        {format(currentDate, "EEEE, d MMMM yyyy", { locale: ru })}
      </h3>

      {/* Items list */}
      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((item, idx) => {
            const isTask = item.itemType === "task";
            const bgColor = item.category?.color || CARD_COLORS[idx % CARD_COLORS.length];

            return (
              <button
                key={`${item.itemType}-${item.id}`}
                type="button"
                onClick={() => onEventClick(item)}
                className="flex w-full items-center gap-4 rounded-3xl p-5 text-left transition-transform hover:-translate-y-1 cursor-pointer"
                style={{ backgroundColor: bgColor }}
              >
                {isTask && (
                  <span className="text-lg text-white/80 shrink-0">
                    {item.taskStatus === "DONE" ? "\u2713" : "\u25A1"}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white uppercase truncate">{item.title}</div>
                  {item.category && (
                    <div className="mt-1">
                      <span className="sticker-label text-[10px]">{item.category.name}</span>
                    </div>
                  )}
                </div>

                {item.createdBy && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white border-2 border-white/30"
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
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-bold uppercase text-[#ccc]">Нет событий</p>
          <p className="text-sm text-[#999] mt-1">на этот день</p>
        </div>
      )}
    </div>
  );
}

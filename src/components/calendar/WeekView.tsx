"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
  isToday,
} from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EventChip } from "./EventChip";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  category?: { id: string; name: string; color: string } | null;
  createdBy?: { id: string; name: string; avatarColor: string } | null;
  assignees?: { id: string; name: string }[];
}

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function WeekView({ currentDate, events, onDateClick, onEventClick }: WeekViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOffset, setMobileOffset] = useState(0);
  const touchRef = useRef<{
    startX: number;
    startY: number;
    swiping: boolean;
  } | null>(null);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Reset offset when currentDate changes (e.g. via header navigation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronous reset is intentional here
    setMobileOffset(0);
  }, [currentDate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // On mobile, show 3 days with swipeable offset
  const getMobileStartIdx = useCallback(() => {
    const idx = allDays.findIndex((d) => isSameDay(d, currentDate));
    const center = idx >= 0 ? idx : 0;
    const baseStart = Math.max(0, Math.min(center - 1, allDays.length - 3));
    return Math.max(0, Math.min(baseStart + mobileOffset, allDays.length - 3));
  }, [allDays, currentDate, mobileOffset]);

  const visibleDays = isMobile
    ? (() => {
        const startIdx = getMobileStartIdx();
        return allDays.slice(startIdx, startIdx + 3);
      })()
    : allDays;

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      setMobileOffset((prev) => {
        const idx = allDays.findIndex((d) => isSameDay(d, currentDate));
        const center = idx >= 0 ? idx : 0;
        const baseStart = Math.max(0, Math.min(center - 1, allDays.length - 3));
        const current = baseStart + prev;

        if (direction === "left" && current < allDays.length - 3) {
          return prev + 1;
        } else if (direction === "right" && current > 0) {
          return prev - 1;
        }
        return prev;
      });
    },
    [allDays, currentDate]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      swiping: false,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchRef.current.startX;
    const diffY = touch.clientY - touchRef.current.startY;

    if (!touchRef.current.swiping && Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      touchRef.current.swiping = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current) return;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - touchRef.current.startX;
      const diffY = touch.clientY - touchRef.current.startY;

      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        handleSwipe(diffX < 0 ? "left" : "right");
      }

      touchRef.current = null;
    },
    [handleSwipe]
  );

  function getEventsForDay(day: Date): CalendarEvent[] {
    return events
      .filter((event) => isSameDay(parseISO(event.startDate), day))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  const mobileStartIdx = isMobile ? getMobileStartIdx() : 0;

  return (
    <div className="px-2 sm:px-0">
      <div
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <div className={cn("grid min-w-0", isMobile ? "grid-cols-3" : "grid-cols-7")}>
          {visibleDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            const today = isToday(day);

            return (
              <div key={day.toISOString()} className="border-r last:border-r-0">
                {/* Day header */}
                <button
                  type="button"
                  onClick={() => onDateClick(day)}
                  className={cn(
                    "w-full border-b p-2 text-center transition-colors hover:bg-gray-50",
                    today && "bg-indigo-50"
                  )}
                >
                  <div className="text-xs text-gray-500 capitalize">
                    {format(day, "EEE", { locale: ru })}
                  </div>
                  <div
                    className={cn(
                      "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                      today && "ring-2 ring-indigo-500 bg-indigo-100 text-indigo-700"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                </button>

                {/* Events list */}
                <div className="min-h-[200px] space-y-1 p-1">
                  {dayEvents.length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-300">&mdash;</p>
                  )}
                  {dayEvents.map((event) => (
                    <div key={event.id} className="mb-1">
                      <EventChip event={event} onClick={() => onEventClick(event)} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swipe indicator dots (mobile only) */}
      {isMobile && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {Array.from({ length: allDays.length - 2 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === mobileStartIdx ? "w-4 bg-indigo-500" : "w-1.5 bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

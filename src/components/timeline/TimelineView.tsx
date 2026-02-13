"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { format, getDaysInMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { useEvents } from "@/hooks/useEvents";
import { EventForm } from "../calendar/EventForm";
import { TaskForm } from "../board/TaskForm";
import { QuickAddMenu, type QuickAddOption } from "../ui/QuickAddMenu";
import { cn } from "@/lib/utils";

const TOTAL_YEARS = 5;
type ViewMode = "vertical" | "horizontal";

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

interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  category?: { id: string; name: string; color: string } | null;
}

export function TimelineView() {
  const todayRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const startYear = currentYear;
  const endYear = currentYear + TOTAL_YEARS - 1;

  // Year navigation
  const canGoPrev = selectedYear > startYear;
  const canGoNext = selectedYear < endYear;

  const goToPrevYear = useCallback(() => {
    if (canGoPrev) setSelectedYear((y) => y - 1);
  }, [canGoPrev]);

  const goToNextYear = useCallback(() => {
    if (canGoNext) setSelectedYear((y) => y + 1);
  }, [canGoNext]);

  // Swipe handlers for year navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartRef.current === null) return;
      const diff = touchStartRef.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 80) {
        if (diff > 0) goToNextYear();
        else goToPrevYear();
      }
      touchStartRef.current = null;
    },
    [goToNextYear, goToPrevYear]
  );

  const { events, isLoading, mutate } = useEvents({
    start: new Date(startYear, 0, 1).toISOString(),
    end: new Date(endYear, 11, 31, 23, 59, 59).toISOString(),
  });

  // Auto-scroll to today section on mount
  useEffect(() => {
    if (!isLoading && todayRef.current) {
      requestAnimationFrame(() => {
        if (!todayRef.current) return;
        const container = todayRef.current.closest(".overflow-y-auto") as HTMLElement | null;
        if (container) {
          todayRef.current.scrollIntoView({ block: "start" });
          container.scrollTop = Math.max(0, container.scrollTop - 70);
        }
      });
    }
  }, [isLoading]);

  function handleEventClick(event: TimelineEvent) {
    setEditingEvent(event);
    setEventFormOpen(true);
  }

  function handleQuickAdd(type: QuickAddOption) {
    if (type === "event") {
      setEditingEvent(null);
      setEventFormOpen(true);
    } else if (type === "task") {
      setTaskFormOpen(true);
    }
  }

  function handleSave() {
    mutate();
  }

  // Generate all months in the range
  const today = new Date();
  const currentMonthKey = format(today, "yyyy-MM");

  const allMonths: {
    key: string;
    label: string;
    events: TimelineEvent[];
    isCurrentMonth: boolean;
  }[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "LLLL yyyy", { locale: ru });

      allMonths.push({
        key: monthKey,
        label: monthLabel,
        events: [],
        isCurrentMonth: monthKey === currentMonthKey,
      });
    }
  }

  // Distribute events into months
  const eventList = (events || []) as TimelineEvent[];
  eventList.forEach((evt) => {
    const date = new Date(evt.date);
    const monthKey = format(date, "yyyy-MM");

    const monthEntry = allMonths.find((m) => m.key === monthKey);
    if (monthEntry) {
      monthEntry.events.push(evt);
    }
  });

  // Sort events within each month by date
  allMonths.forEach((month) => {
    month.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return (
    <div className="relative h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8 flex items-center justify-between shrink-0 bg-white">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
          <span className="bg-[var(--c-yellow)] px-4 py-1 rounded-xl inline-block">Таймлайн</span>
        </h1>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-full bg-[var(--c-gray)] p-1">
            <button
              type="button"
              onClick={() => setViewMode("vertical")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold uppercase transition-all cursor-pointer",
                viewMode === "vertical"
                  ? "bg-[var(--c-black)] text-white"
                  : "text-[var(--c-black)] hover:bg-white"
              )}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Список</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("horizontal")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold uppercase transition-all cursor-pointer",
                viewMode === "horizontal"
                  ? "bg-[var(--c-black)] text-white"
                  : "text-[var(--c-black)] hover:bg-white"
              )}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
              <span className="hidden sm:inline">Линия</span>
            </button>
          </div>
          <span className="bg-[var(--c-black)] text-white rounded-full px-3 py-1.5 text-xs font-bold uppercase">
            {startYear} &ndash; {endYear}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 md:px-8 py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
          <span className="text-sm font-bold uppercase text-[#999]">Загрузка...</span>
        </div>
      )}

      {/* Horizontal timeline view */}
      {viewMode === "horizontal" && (
        <div
          className="flex-1 overflow-hidden pb-24 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Year navigation */}
          <div className="flex items-center justify-center gap-4 py-4 bg-white">
            <button
              type="button"
              onClick={goToPrevYear}
              disabled={!canGoPrev}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
                canGoPrev
                  ? "bg-[var(--c-black)] text-white hover:scale-105"
                  : "bg-[var(--c-gray)] text-[#ccc] cursor-not-allowed"
              )}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1 rounded-full bg-[var(--c-gray)] p-1">
              {Array.from({ length: TOTAL_YEARS }, (_, i) => {
                const year = startYear + i;
                const isSelected = year === selectedYear;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold uppercase transition-all cursor-pointer",
                      isSelected
                        ? "bg-[var(--c-black)] text-white"
                        : "text-[var(--c-black)] hover:bg-white"
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={goToNextYear}
              disabled={!canGoNext}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
                canGoNext
                  ? "bg-[var(--c-black)] text-white hover:scale-105"
                  : "bg-[var(--c-gray)] text-[#ccc] cursor-not-allowed"
              )}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Timeline content */}
          <div ref={horizontalScrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            {/* Month columns grid */}
            <div className="grid grid-cols-12 gap-1 sm:gap-2 min-h-[400px]">
              {Array.from({ length: 12 }, (_, monthIdx) => {
                const monthDate = new Date(selectedYear, monthIdx, 1);
                const monthKey = format(monthDate, "yyyy-MM");
                const isCurrentMonth = monthKey === currentMonthKey;
                const isPastMonth = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEvents = eventList.filter((evt) => {
                  const evtDate = new Date(evt.date);
                  return evtDate.getFullYear() === selectedYear && evtDate.getMonth() === monthIdx;
                });

                // Calculate today position within month
                const isCurrentMonthWithToday =
                  isCurrentMonth && selectedYear === today.getFullYear();
                const todayPosition = isCurrentMonthWithToday
                  ? ((today.getDate() - 1) / getDaysInMonth(today)) * 100
                  : null;

                return (
                  <div
                    key={monthIdx}
                    className={cn(
                      "flex flex-col rounded-2xl transition-all min-h-[350px] overflow-hidden",
                      isCurrentMonth
                        ? "ring-2 ring-[var(--c-black)]"
                        : isPastMonth
                          ? "opacity-50"
                          : "",
                      "bg-[var(--c-gray)]"
                    )}
                  >
                    {/* Month header */}
                    <div
                      className="py-2 px-1 text-center"
                      style={{
                        backgroundColor: isCurrentMonth ? MONTH_COLORS[monthIdx] : undefined,
                      }}
                    >
                      <div
                        className={cn(
                          "text-xs sm:text-sm font-bold uppercase",
                          isCurrentMonth ? "text-white" : "text-[var(--c-black)]"
                        )}
                      >
                        {format(monthDate, "LLL", { locale: ru })}
                      </div>
                    </div>

                    {/* Timeline bar within month */}
                    <div className="relative h-2 mx-1 mt-2 bg-white/50 rounded-full">
                      {/* Today marker */}
                      {todayPosition !== null && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--c-black)] rounded-full border-2 border-white z-10"
                          style={{ left: `${todayPosition}%`, marginLeft: "-6px" }}
                          title="Сегодня"
                        />
                      )}
                      {/* Event markers on mini timeline */}
                      {monthEvents.map((evt) => {
                        const evtDate = new Date(evt.date);
                        const dayPosition =
                          ((evtDate.getDate() - 1) / getDaysInMonth(evtDate)) * 100;
                        const displayColor = evt.category?.color || "var(--c-coral)";
                        return (
                          <div
                            key={evt.id}
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                            style={{
                              left: `${dayPosition}%`,
                              marginLeft: "-4px",
                              backgroundColor: displayColor,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Events list */}
                    <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                      {monthEvents.length > 0 ? (
                        monthEvents.map((evt) => {
                          const evtDate = new Date(evt.date);
                          const displayColor = evt.category?.color || "var(--c-coral)";
                          const isPast = evtDate < today;
                          return (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => handleEventClick(evt)}
                              className={cn(
                                "w-full text-left p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer",
                                "hover:scale-[1.02] bg-white",
                                isPast && "opacity-50"
                              )}
                            >
                              <div className="flex items-start gap-1">
                                <span
                                  className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                                  style={{ backgroundColor: displayColor }}
                                >
                                  {evtDate.getDate()}
                                </span>
                                <span className="text-[10px] sm:text-xs font-bold text-[var(--c-black)] line-clamp-2 leading-tight uppercase">
                                  {evt.title}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[10px] text-[#ccc] font-bold">—</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vertical scrollable timeline */}
      {viewMode === "vertical" && (
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Year sections */}
          {Array.from({ length: TOTAL_YEARS }, (_, yearIdx) => {
            const year = startYear + yearIdx;
            const yearMonths = allMonths.filter((m) => m.key.startsWith(String(year)));
            const isCurrentYear = year === today.getFullYear();
            const isPastYear = year < today.getFullYear();

            return (
              <div key={year} className={cn("mb-2", isPastYear && "opacity-60")}>
                {/* Year header */}
                <div className="sticky top-0 z-20 px-4 md:px-8 py-3 bg-white">
                  <h2 className="text-lg font-extrabold uppercase tracking-tight text-[var(--c-black)]">
                    <span
                      className={cn(
                        "inline-block rounded-xl px-4 py-1",
                        isCurrentYear ? "bg-[var(--c-yellow)]" : "bg-[var(--c-gray)]"
                      )}
                    >
                      {year}
                      {isCurrentYear && (
                        <span className="ml-2 text-sm font-bold opacity-50">— текущий год</span>
                      )}
                    </span>
                  </h2>
                </div>

                {/* Months grid */}
                <div className="px-4 md:px-8 py-4 space-y-4">
                  {yearMonths.map(
                    ({ key: monthKey, events: monthEvents, isCurrentMonth }, monthIdx) => {
                      const monthDate = new Date(monthKey + "-01");
                      const monthName = format(monthDate, "LLLL", { locale: ru });
                      const isPast = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);

                      return (
                        <div
                          key={monthKey}
                          ref={isCurrentMonth ? todayRef : undefined}
                          className={cn(
                            "rounded-3xl p-5 transition-all",
                            isPast && "opacity-50",
                            isCurrentMonth
                              ? "text-white"
                              : "bg-[var(--c-gray)] text-[var(--c-black)]"
                          )}
                          style={
                            isCurrentMonth
                              ? { backgroundColor: MONTH_COLORS[monthIdx % 12] }
                              : undefined
                          }
                        >
                          {/* Month header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-full font-bold text-lg",
                                isCurrentMonth
                                  ? "bg-white/20 text-white"
                                  : "bg-white text-[var(--c-black)]"
                              )}
                            >
                              {format(monthDate, "M", { locale: ru })}
                            </div>
                            <div>
                              <h3 className="font-extrabold uppercase tracking-tight capitalize">
                                {monthName}
                              </h3>
                              {isCurrentMonth && (
                                <span className="text-xs font-bold text-white/70 uppercase">
                                  Текущий месяц
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Events */}
                          {monthEvents.length > 0 ? (
                            <div className="space-y-2">
                              {monthEvents.map((evt) => {
                                const displayColor = evt.category?.color || "var(--c-coral)";

                                return (
                                  <button
                                    key={evt.id}
                                    type="button"
                                    onClick={() => handleEventClick(evt)}
                                    className={cn(
                                      "w-full text-left p-3 rounded-2xl transition-all cursor-pointer",
                                      "hover:-translate-y-0.5",
                                      isCurrentMonth
                                        ? "bg-white/20 hover:bg-white/30"
                                        : "bg-white hover:bg-white/80"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{ backgroundColor: displayColor }}
                                      >
                                        <svg
                                          className="h-4 w-4 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={2}
                                          stroke="currentColor"
                                        >
                                          <rect x="3" y="4" width="18" height="18" rx="2" />
                                          <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={cn(
                                              "font-bold uppercase text-sm",
                                              isCurrentMonth
                                                ? "text-white"
                                                : "text-[var(--c-black)]"
                                            )}
                                          >
                                            {evt.title}
                                          </span>
                                          {evt.category && (
                                            <span className="bg-[var(--c-black)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                              {evt.category.name}
                                            </span>
                                          )}
                                        </div>
                                        {evt.description && (
                                          <p
                                            className={cn(
                                              "text-xs truncate mt-0.5",
                                              isCurrentMonth ? "text-white/60" : "text-[#999]"
                                            )}
                                          >
                                            {evt.description}
                                          </p>
                                        )}
                                      </div>
                                      <span
                                        className={cn(
                                          "text-sm font-bold rounded-full px-3 py-1",
                                          isCurrentMonth
                                            ? "bg-white/20 text-white"
                                            : "bg-white text-[var(--c-black)]"
                                        )}
                                      >
                                        {format(new Date(evt.date), "d", {
                                          locale: ru,
                                        })}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p
                              className={cn(
                                "text-sm font-bold uppercase",
                                isCurrentMonth ? "text-white/40" : "text-[#ccc]"
                              )}
                            >
                              Нет событий
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick add menu */}
      <QuickAddMenu options={["event", "task"]} onSelect={handleQuickAdd} />

      {/* Event form modal */}
      <EventForm
        isOpen={eventFormOpen}
        onClose={() => {
          setEventFormOpen(false);
          setEditingEvent(null);
        }}
        event={
          editingEvent
            ? {
                id: editingEvent.id,
                title: editingEvent.title,
                description: editingEvent.description,
                date: editingEvent.date,
                categoryId: editingEvent.category?.id ?? null,
                category: editingEvent.category,
              }
            : null
        }
        onSave={handleSave}
      />

      {/* Task form modal */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        onSave={() => setTaskFormOpen(false)}
      />
    </div>
  );
}

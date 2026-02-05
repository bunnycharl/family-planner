"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { format, differenceInMonths, getDaysInMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { useEvents } from "@/hooks/useEvents";
import { EventForm } from "../calendar/EventForm";
import { TaskForm } from "../board/TaskForm";
import { QuickAddMenu, type QuickAddOption } from "../ui/QuickAddMenu";
import { cn } from "@/lib/utils";

const TOTAL_YEARS = 5;
type ViewMode = "vertical" | "horizontal";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  isCompleted?: boolean;
  color?: string | null;
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
    const date = new Date(evt.startDate);
    const monthKey = format(date, "yyyy-MM");

    const monthEntry = allMonths.find((m) => m.key === monthKey);
    if (monthEntry) {
      monthEntry.events.push(evt);
    }
  });

  // Sort events within each month by date
  allMonths.forEach((month) => {
    month.events.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  });

  return (
    <div className="relative h-full flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0 bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Таймлайн</h1>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("vertical")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                viewMode === "vertical"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Список</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("horizontal")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                viewMode === "horizontal"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span className="hidden sm:inline">Линия</span>
            </button>
          </div>
          <span className="text-sm font-medium text-[var(--color-text-muted)] bg-[var(--color-bg)] px-3 py-1.5 rounded-lg">
            {startYear} &ndash; {endYear}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 py-12 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Загрузка...</span>
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
          <div className="flex items-center justify-center gap-4 py-4 bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
            <button
              type="button"
              onClick={goToPrevYear}
              disabled={!canGoPrev}
              className={cn(
                "p-2 rounded-xl transition-all cursor-pointer",
                canGoPrev
                  ? "hover:bg-[var(--color-bg)] text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed"
              )}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_YEARS }, (_, i) => {
                const year = startYear + i;
                const isSelected = year === selectedYear;
                const isCurrent = year === currentYear;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-md"
                        : isCurrent
                          ? "bg-[var(--color-primary-50)] text-[var(--color-primary)]"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
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
                "p-2 rounded-xl transition-all cursor-pointer",
                canGoNext
                  ? "hover:bg-[var(--color-bg)] text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed"
              )}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Timeline content */}
          <div
            ref={horizontalScrollRef}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            {/* Month columns grid */}
            <div className="grid grid-cols-12 gap-1 sm:gap-2 min-h-[400px]">
              {Array.from({ length: 12 }, (_, monthIdx) => {
                const monthDate = new Date(selectedYear, monthIdx, 1);
                const monthKey = format(monthDate, "yyyy-MM");
                const isCurrentMonth = monthKey === currentMonthKey;
                const isPastMonth = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEvents = eventList.filter((evt) => {
                  const evtDate = new Date(evt.startDate);
                  return evtDate.getFullYear() === selectedYear && evtDate.getMonth() === monthIdx;
                });

                // Calculate today position within month
                const isCurrentMonthWithToday = isCurrentMonth && selectedYear === today.getFullYear();
                const todayPosition = isCurrentMonthWithToday
                  ? ((today.getDate() - 1) / getDaysInMonth(today)) * 100
                  : null;

                return (
                  <div
                    key={monthIdx}
                    className={cn(
                      "flex flex-col rounded-xl border-2 transition-all min-h-[350px]",
                      isCurrentMonth
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-50)]/50"
                        : isPastMonth
                          ? "border-[var(--color-border)] bg-[var(--color-bg)] opacity-60"
                          : "border-[var(--color-border)] bg-[var(--color-bg-card)]"
                    )}
                  >
                    {/* Month header */}
                    <div
                      className={cn(
                        "py-2 px-1 text-center border-b",
                        isCurrentMonth
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-[var(--color-bg)] border-[var(--color-border)]"
                      )}
                    >
                      <div className="text-xs sm:text-sm font-bold capitalize">
                        {format(monthDate, "LLL", { locale: ru })}
                      </div>
                    </div>

                    {/* Timeline bar within month */}
                    <div className="relative h-2 mx-1 mt-2 bg-[var(--color-border)] rounded-full">
                      {/* Today marker */}
                      {todayPosition !== null && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-primary)] rounded-full border-2 border-white shadow-md z-10"
                          style={{ left: `${todayPosition}%`, marginLeft: "-6px" }}
                          title="Сегодня"
                        />
                      )}
                      {/* Event markers on mini timeline */}
                      {monthEvents.map((evt) => {
                        const evtDate = new Date(evt.startDate);
                        const dayPosition = ((evtDate.getDate() - 1) / getDaysInMonth(evtDate)) * 100;
                        const displayColor = evt.color || evt.category?.color || "#0D9488";
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
                          const evtDate = new Date(evt.startDate);
                          const displayColor = evt.color || evt.category?.color || "#0D9488";
                          const isPast = evtDate < today;
                          return (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => handleEventClick(evt)}
                              className={cn(
                                "w-full text-left p-1.5 sm:p-2 rounded-lg border-l-3 transition-all cursor-pointer",
                                "hover:shadow-md bg-[var(--color-bg-card)]",
                                isPast && "opacity-50"
                              )}
                              style={{ borderLeftColor: displayColor, borderLeftWidth: "3px" }}
                            >
                              <div className="flex items-start gap-1">
                                <span
                                  className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                                  style={{ backgroundColor: displayColor }}
                                >
                                  {evtDate.getDate()}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-[var(--color-text)] line-clamp-2 leading-tight">
                                  {evt.title}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[10px] text-[var(--color-text-muted)] italic">—</span>
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
          const yearMonths = allMonths.filter(
            (m) => m.key.startsWith(String(year))
          );
          const isCurrentYear = year === today.getFullYear();
          const isPastYear = year < today.getFullYear();

          return (
            <div key={year} className={cn("mb-2", isPastYear && "opacity-60")}>
              {/* Year header */}
              <div
                className={cn(
                  "sticky top-0 z-20 px-4 py-3 border-b backdrop-blur-sm",
                  isCurrentYear
                    ? "bg-[var(--color-primary-50)]/90 border-[var(--color-primary)]/20"
                    : isPastYear
                      ? "bg-[var(--color-bg)]/90 border-[var(--color-border)]"
                      : "bg-[var(--color-bg-card)]/90 border-[var(--color-border)]"
                )}
              >
                <h2
                  className={cn(
                    "text-lg font-bold",
                    isCurrentYear
                      ? "text-[var(--color-primary)]"
                      : isPastYear
                        ? "text-[var(--color-text-muted)]"
                        : "text-[var(--color-text)]"
                  )}
                >
                  {year}
                  {isCurrentYear && (
                    <span className="ml-2 text-sm font-normal text-[var(--color-primary-light)]">
                      — текущий год
                    </span>
                  )}
                </h2>
              </div>

              {/* Months grid */}
              <div className="px-4 py-4 space-y-6">
                {yearMonths.map(({ key: monthKey, events: monthEvents, isCurrentMonth }) => {
                  const monthDate = new Date(monthKey + "-01");
                  const monthName = format(monthDate, "LLLL", { locale: ru });
                  const isPast = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);

                  return (
                    <div
                      key={monthKey}
                      ref={isCurrentMonth ? todayRef : undefined}
                      className={cn(
                        "rounded-2xl p-4 transition-all",
                        isPast && "opacity-50",
                        isCurrentMonth
                          ? "bg-[var(--color-primary-50)] ring-2 ring-[var(--color-primary)]/30"
                          : "bg-[var(--color-bg-card)] border border-[var(--color-border)]"
                      )}
                    >
                      {/* Month header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl font-bold text-lg",
                            isCurrentMonth
                              ? "bg-[var(--color-primary)] text-white shadow-sm"
                              : "bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                          )}
                        >
                          {format(monthDate, "M", { locale: ru })}
                        </div>
                        <div>
                          <h3
                            className={cn(
                              "font-semibold capitalize",
                              isCurrentMonth ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"
                            )}
                          >
                            {monthName}
                          </h3>
                          {isCurrentMonth && (
                            <span className="text-xs text-[var(--color-primary-light)]">
                              Текущий месяц
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Events */}
                      {monthEvents.length > 0 ? (
                        <div className="space-y-2">
                          {monthEvents.map((evt) => {
                            // Event with color = milestone-like (flag icon)
                            // Event without color = regular event (calendar icon)
                            const hasColor = !!evt.color;
                            const displayColor = evt.color || evt.category?.color || "#0D9488";

                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => handleEventClick(evt)}
                                className={cn(
                                  "w-full text-left p-3 rounded-xl bg-[var(--color-bg-card)] border transition-all cursor-pointer",
                                  "hover:shadow-md hover:border-[var(--color-primary)]/30",
                                  evt.isCompleted
                                    ? "opacity-60 border-[var(--color-border)]"
                                    : "border-l-4 border-[var(--color-border)] shadow-sm"
                                )}
                                style={{
                                  borderLeftColor: evt.isCompleted
                                    ? undefined
                                    : displayColor,
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={cn(
                                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                      evt.isCompleted && "ring-2 ring-[var(--color-success)] ring-offset-1"
                                    )}
                                    style={{ backgroundColor: displayColor }}
                                  >
                                    {evt.isCompleted ? (
                                      <svg
                                        className="h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={3}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4.5 12.75l6 6 9-13.5"
                                        />
                                      </svg>
                                    ) : hasColor ? (
                                      // Flag icon for events with custom color
                                      <svg
                                        className="h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
                                        />
                                      </svg>
                                    ) : (
                                      // Calendar icon for regular events
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
                                    )}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-[var(--color-text)]">
                                        {evt.title}
                                      </span>
                                      {evt.category && (
                                        <span
                                          className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-white"
                                          style={{ backgroundColor: evt.category.color }}
                                        >
                                          {evt.category.name}
                                        </span>
                                      )}
                                    </div>
                                    {evt.description && (
                                      <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                                        {evt.description}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-sm font-bold text-[var(--color-text-secondary)] bg-[var(--color-bg)] px-2 py-1 rounded-lg">
                                    {format(new Date(evt.startDate), "d", {
                                      locale: ru,
                                    })}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--color-text-muted)] italic">
                          Нет событий
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Quick add menu */}
      <QuickAddMenu
        options={["event", "task"]}
        onSelect={handleQuickAdd}
      />

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
                startDate: editingEvent.startDate,
                categoryId: editingEvent.category?.id ?? null,
                category: editingEvent.category,
                isCompleted: editingEvent.isCompleted,
                color: editingEvent.color,
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

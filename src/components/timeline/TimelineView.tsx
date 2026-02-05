"use client";

import { useRef, useEffect, useState } from "react";
import { format, differenceInMonths } from "date-fns";
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
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const currentYear = new Date().getFullYear();
  const startYear = currentYear;
  const endYear = currentYear + TOTAL_YEARS - 1;

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
        <div className="flex-1 overflow-hidden pb-24">
          <div
            ref={horizontalScrollRef}
            className="h-full overflow-x-auto overflow-y-auto px-4 py-6"
          >
            {/* Timeline container */}
            <div className="relative min-w-[1200px] pb-8">
              {/* Year markers */}
              <div className="flex mb-2">
                {Array.from({ length: TOTAL_YEARS }, (_, i) => {
                  const year = startYear + i;
                  const isCurrentYear = year === today.getFullYear();
                  return (
                    <div key={year} className="flex-1 text-center">
                      <span
                        className={cn(
                          "inline-block px-4 py-1.5 rounded-lg text-sm font-bold",
                          isCurrentYear
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                        )}
                      >
                        {year}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Main timeline line */}
              <div className="relative h-3 bg-[var(--color-border)] rounded-full my-6">
                {/* Current position marker */}
                {(() => {
                  const totalMonths = TOTAL_YEARS * 12;
                  const monthsFromStart = differenceInMonths(today, new Date(startYear, 0, 1));
                  const progressPercent = Math.min(100, Math.max(0, (monthsFromStart / totalMonths) * 100));
                  return (
                    <>
                      {/* Progress fill */}
                      <div
                        className="absolute top-0 left-0 h-full bg-[var(--color-primary)]/30 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                      {/* Today marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--color-primary)] rounded-full border-4 border-white shadow-lg z-10"
                        style={{ left: `${progressPercent}%`, marginLeft: "-10px" }}
                        title="Сегодня"
                      />
                    </>
                  );
                })()}

                {/* Event markers on the line */}
                {eventList.map((evt) => {
                  const evtDate = new Date(evt.startDate);
                  const monthsFromStart = differenceInMonths(evtDate, new Date(startYear, 0, 1));
                  const totalMonths = TOTAL_YEARS * 12;
                  const positionPercent = Math.min(100, Math.max(0, (monthsFromStart / totalMonths) * 100));
                  const displayColor = evt.color || evt.category?.color || "#0D9488";
                  const isPast = evtDate < today;

                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => handleEventClick(evt)}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-150 z-20",
                        isPast && "opacity-50"
                      )}
                      style={{
                        left: `${positionPercent}%`,
                        marginLeft: "-8px",
                        backgroundColor: displayColor,
                      }}
                      title={`${evt.title} - ${format(evtDate, "d MMM yyyy", { locale: ru })}`}
                    />
                  );
                })}
              </div>

              {/* Month labels */}
              <div className="flex text-[10px] text-[var(--color-text-muted)] mb-8">
                {Array.from({ length: TOTAL_YEARS }, (_, yearIdx) => (
                  <div key={yearIdx} className="flex-1 flex">
                    {Array.from({ length: 12 }, (_, monthIdx) => {
                      const monthDate = new Date(startYear + yearIdx, monthIdx, 1);
                      const isCurrentMonth = format(monthDate, "yyyy-MM") === currentMonthKey;
                      return (
                        <div
                          key={monthIdx}
                          className={cn(
                            "flex-1 text-center",
                            isCurrentMonth && "font-bold text-[var(--color-primary)]"
                          )}
                        >
                          {format(monthDate, "MMM", { locale: ru })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Events list below timeline */}
              <div className="space-y-2 max-w-3xl mx-auto">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">
                  Ближайшие события
                </h3>
                {eventList
                  .filter((evt) => new Date(evt.startDate) >= today)
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 10)
                  .map((evt) => {
                    const displayColor = evt.color || evt.category?.color || "#0D9488";
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => handleEventClick(evt)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-sm transition-all cursor-pointer text-left"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: displayColor }}
                        />
                        <span className="flex-1 font-medium text-[var(--color-text)] truncate">
                          {evt.title}
                        </span>
                        {evt.category && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold text-white shrink-0"
                            style={{ backgroundColor: evt.category.color }}
                          >
                            {evt.category.name}
                          </span>
                        )}
                        <span className="text-sm text-[var(--color-text-secondary)] shrink-0">
                          {format(new Date(evt.startDate), "d MMM yyyy", { locale: ru })}
                        </span>
                      </button>
                    );
                  })}
                {eventList.filter((evt) => new Date(evt.startDate) >= today).length === 0 && (
                  <p className="text-sm text-[var(--color-text-muted)] italic text-center py-4">
                    Нет предстоящих событий
                  </p>
                )}
              </div>
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

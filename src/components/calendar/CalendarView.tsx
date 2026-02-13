"use client";

import { useState, useCallback, useMemo } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { CalendarHeader, type ViewMode } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { DayView } from "./DayView";
import { YearView } from "./YearView";
import { EventForm } from "./EventForm";
import { TaskForm } from "../board/TaskForm";
import { QuickAddMenu, type QuickAddOption } from "../ui/QuickAddMenu";
import { type CalendarItem, eventToCalendarItem, taskToCalendarItem } from "@/types/calendar";

const SSR_SAFE_DEFAULT: ViewMode = "day";

function getDateRange(date: Date, viewMode: ViewMode): { start: string; end: string } {
  switch (viewMode) {
    case "day":
      return {
        start: startOfDay(date).toISOString(),
        end: endOfDay(date).toISOString(),
      };
    case "month": {
      const mStart = startOfMonth(date);
      const mEnd = endOfMonth(date);
      return {
        start: startOfWeek(mStart, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(mEnd, { weekStartsOn: 1 }).toISOString(),
      };
    }
    case "year":
      return {
        start: startOfYear(date).toISOString(),
        end: endOfYear(date).toISOString(),
      };
  }
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(SSR_SAFE_DEFAULT);

  // Event form state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null);
  const [defaultFormDate, setDefaultFormDate] = useState<Date | undefined>(undefined);

  // Task form state
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    description?: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    startDate?: string | null;
    endDate?: string | null;
    phaseId?: string | null;
    categoryId?: string | null;
    assigneeId?: string | null;
  } | null>(null);

  const dateRange = useMemo(() => getDateRange(currentDate, viewMode), [currentDate, viewMode]);

  const { events, mutate: mutateEvents } = useEvents({
    start: dateRange.start,
    end: dateRange.end,
  });

  const { tasks, mutate: mutateTasks } = useTasks({
    endDateFrom: dateRange.start,
    endDateTo: dateRange.end,
  });

  // Merge events and tasks into CalendarItem[]
  const calendarItems: CalendarItem[] = useMemo(() => {
    const eventItems = (events || []).map(eventToCalendarItem);
    const taskItems = (tasks || [])
      .filter((t: { endDate?: string | null }) => t.endDate)
      .map(taskToCalendarItem);
    return [...eventItems, ...taskItems];
  }, [events, tasks]);

  // Click on day in MonthView → go to DayView
  const handleDateClick = useCallback(
    (date: Date) => {
      if (viewMode === "month") {
        setCurrentDate(date);
        setViewMode("day");
      }
    },
    [viewMode]
  );

  // Click on calendar item
  const handleItemClick = useCallback(
    (item: CalendarItem) => {
      if (item.itemType === "task") {
        // Find original task data to open TaskForm
        const originalTask = (tasks || []).find((t: { id: string }) => t.id === item.id);
        if (originalTask) {
          setSelectedTask({
            id: originalTask.id,
            title: originalTask.title,
            description: originalTask.description,
            status: originalTask.status,
            startDate: originalTask.startDate,
            endDate: originalTask.endDate,
            phaseId: originalTask.phaseId,
            categoryId: originalTask.categoryId,
            assigneeId: originalTask.assigneeId,
          });
          setTaskFormOpen(true);
        }
      } else {
        setSelectedEvent(item);
        setDefaultFormDate(undefined);
        setFormOpen(true);
      }
    },
    [tasks]
  );

  const handleMonthClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setViewMode("month");
  }, []);

  const handleFormSave = useCallback(() => {
    mutateEvents();
    mutateTasks();
  }, [mutateEvents, mutateTasks]);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setSelectedEvent(null);
    setDefaultFormDate(undefined);
  }, []);

  const handleTaskFormClose = useCallback(() => {
    setTaskFormOpen(false);
    setSelectedTask(null);
  }, []);

  const handleTaskFormSave = useCallback(() => {
    mutateEvents();
    mutateTasks();
    setTaskFormOpen(false);
    setSelectedTask(null);
  }, [mutateEvents, mutateTasks]);

  // Quick add menu handler
  const handleQuickAdd = useCallback(
    (type: QuickAddOption) => {
      if (type === "event") {
        setSelectedEvent(null);
        setDefaultFormDate(currentDate);
        setFormOpen(true);
      } else if (type === "task") {
        setSelectedTask(null);
        setTaskFormOpen(true);
      }
    },
    [currentDate]
  );

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />

      <div className="flex-1 overflow-auto">
        {viewMode === "month" && (
          <MonthView
            currentDate={currentDate}
            events={calendarItems}
            onDateClick={handleDateClick}
            onEventClick={handleItemClick}
          />
        )}

        {viewMode === "day" && (
          <DayView
            currentDate={currentDate}
            events={calendarItems}
            onEventClick={handleItemClick}
            onDateChange={setCurrentDate}
          />
        )}

        {viewMode === "year" && (
          <YearView
            currentDate={currentDate}
            events={calendarItems}
            onMonthClick={handleMonthClick}
          />
        )}
      </div>

      {/* Quick add menu */}
      <QuickAddMenu onSelect={handleQuickAdd} />

      {/* Event form modal */}
      <EventForm
        isOpen={formOpen}
        onClose={handleFormClose}
        event={
          selectedEvent && selectedEvent.itemType === "event"
            ? {
                id: selectedEvent.id,
                title: selectedEvent.title,
                date: selectedEvent.date,
                categoryId: selectedEvent.category?.id ?? null,
                category: selectedEvent.category,
              }
            : null
        }
        defaultDate={defaultFormDate}
        onSave={handleFormSave}
      />

      {/* Task form modal */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={handleTaskFormClose}
        task={selectedTask}
        onSave={handleTaskFormSave}
      />
    </div>
  );
}

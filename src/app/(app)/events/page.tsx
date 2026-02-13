"use client";

import { useState, useCallback } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useCategories } from "@/hooks/useCategories";
import { FilterBar } from "@/components/events/FilterBar";
import { EventList } from "@/components/events/EventList";
import { EventForm } from "@/components/calendar/EventForm";
import { TaskForm } from "@/components/board/TaskForm";
import { QuickAddMenu, type QuickAddOption } from "@/components/ui/QuickAddMenu";

interface Filters {
  categoryId?: string;
  start?: string;
  end?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CalendarEvent = any;

export default function EventsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const { events, isLoading, mutate } = useEvents({
    start: filters.start,
    end: filters.end,
    categoryId: filters.categoryId,
  });

  const { categories } = useCategories();

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  }, []);

  const handleQuickAdd = useCallback((type: QuickAddOption) => {
    if (type === "event") {
      setEditingEvent(null);
      setIsFormOpen(true);
    } else if (type === "task") {
      setIsTaskFormOpen(true);
    }
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEvent(null);
  }, []);

  const handleSave = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Page title */}
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
        <span className="bg-[var(--c-mint)] px-4 py-1 rounded-xl inline-block">События</span>
      </h1>

      {/* Filter bar */}
      <FilterBar filters={filters} onFiltersChange={setFilters} categories={categories} />

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
        </div>
      ) : (
        <EventList events={events} onEventClick={handleEventClick} />
      )}

      {/* Quick add menu */}
      <QuickAddMenu onSelect={handleQuickAdd} />

      {/* Event form modal */}
      <EventForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        event={editingEvent}
        onSave={handleSave}
      />

      {/* Task form modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSave={() => setIsTaskFormOpen(false)}
      />
    </div>
  );
}

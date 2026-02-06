"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EventForm } from "@/components/calendar/EventForm";

interface EventDetail {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; color: string } | null;
  createdBy: { name: string; avatarColor: string };
  modifiedBy?: { name: string } | null;
  assignees: { id: string; name: string; avatarColor: string }[];
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const data = await res.json();
      setEvent(data);
    } catch {
      toast.error("Не удалось загрузить событие");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function handleDelete() {
    if (!event) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Событие удалено");
      router.push("/events");
    } catch {
      toast.error("Не удалось удалить событие");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function formatDate(event: EventDetail): string {
    const start = new Date(event.startDate);

    if (event.endDate) {
      const end = new Date(event.endDate);
      const sameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

      if (!sameDay) {
        return `${format(start, "d MMMM yyyy", { locale: ru })} \u2013 ${format(end, "d MMMM yyyy", { locale: ru })}`;
      }
    }

    return format(start, "d MMMM yyyy", { locale: ru });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 md:p-6 text-center py-24">
        <p className="text-[var(--color-text-muted)]">Событие не найдено</p>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
        >
          Вернуться к списку
        </button>
      </div>
    );
  }

  const creatorInitials = event.createdBy.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push("/events")}
        className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Назад к событиям
      </button>

      {/* Header card */}
      <div
        className="bg-[var(--color-bg-card)] rounded-lg shadow-sm border border-[var(--color-border)] border-l-4 p-6"
        style={{ borderLeftColor: event.category?.color ?? "#9ca3af" }}
      >
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-[var(--color-text)]">{event.title}</h1>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                "text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-colors"
              )}
            >
              Редактировать
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                "text-[var(--color-error)] bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 transition-colors"
              )}
            >
              Удалить
            </button>
          </div>
        </div>

        {/* Category badge */}
        {event.category && (
          <div className="mt-3">
            <span
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: event.category.color }}
            >
              {event.category.name}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <svg
            className="h-4 w-4 text-[var(--color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
          {formatDate(event)}
        </div>

        {/* Location */}
        {event.location && (
          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <svg
              className="h-4 w-4 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            {event.location}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text)] mb-1">Описание</h2>
            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Creator */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <h2 className="text-sm font-medium text-[var(--color-text)] mb-2">Создатель</h2>
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: event.createdBy.avatarColor }}
            >
              {creatorInitials}
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              {event.createdBy.name}
            </span>
          </div>
        </div>

        {/* Assignees */}
        {event.assignees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text)] mb-2">Участники</h2>
            <div className="flex flex-wrap gap-2">
              {event.assignees.map((assignee) => {
                const initials = assignee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={assignee.id}
                    className="flex items-center gap-2 rounded-full bg-[var(--color-border-light)] px-3 py-1"
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white"
                      style={{ backgroundColor: assignee.avatarColor }}
                    >
                      {initials}
                    </div>
                    <span className="text-sm text-[var(--color-text)]">{assignee.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-[var(--color-bg-card)] p-6 shadow-xl mx-4 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Удалить событие?</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Это действие нельзя отменить. Событие &laquo;{event.title}&raquo; будет удалено
              навсегда.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:bg-[var(--color-border-light)]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium text-white bg-[var(--color-error)] hover:opacity-90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isDeleting ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit form modal */}
      <EventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        event={event}
        onSave={() => {
          fetchEvent();
        }}
      />
    </div>
  );
}

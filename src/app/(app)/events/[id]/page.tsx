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
        return `${format(start, "d MMMM yyyy", { locale: ru })} – ${format(end, "d MMMM yyyy", { locale: ru })}`;
      }
    }

    return format(start, "d MMMM yyyy", { locale: ru });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 md:p-6 text-center py-24">
        <p className="text-sm font-bold uppercase text-[#999]">Событие не найдено</p>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="mt-4 text-sm font-bold uppercase text-[var(--c-black)] hover:underline cursor-pointer"
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
        className="flex items-center gap-1 text-sm font-bold uppercase text-[#999] hover:text-[var(--c-black)] transition-colors cursor-pointer"
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
        className="rounded-3xl p-6"
        style={{ backgroundColor: event.category?.color ?? "var(--c-coral)" }}
      >
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
            {event.title}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase text-white bg-white/20 hover:bg-white/30 transition-all cursor-pointer"
            >
              Редактировать
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase text-white bg-white/20 hover:bg-[var(--c-coral)] transition-all cursor-pointer"
            >
              Удалить
            </button>
          </div>
        </div>

        {/* Category badge */}
        {event.category && (
          <div className="mt-3">
            <span className="bg-[var(--c-black)] text-white rounded-full px-3 py-1 text-[10px] font-bold uppercase">
              {event.category.name}
            </span>
          </div>
        )}

        {/* Date */}
        <div className="mt-4 flex items-center gap-2 text-sm text-white/80 font-bold">
          <svg
            className="h-4 w-4"
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
          <div className="mt-2 flex items-center gap-2 text-sm text-white/80 font-bold">
            <svg
              className="h-4 w-4"
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
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-[var(--c-gray)] rounded-3xl p-5">
          <h2 className="text-xs font-bold uppercase text-[#999] mb-2">Описание</h2>
          <p className="text-sm text-[var(--c-black)] whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      {/* Creator */}
      <div className="bg-[var(--c-gray)] rounded-3xl p-5">
        <h2 className="text-xs font-bold uppercase text-[#999] mb-3">Создатель</h2>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: event.createdBy.avatarColor }}
          >
            {creatorInitials}
          </div>
          <span className="text-sm font-bold text-[var(--c-black)]">{event.createdBy.name}</span>
        </div>
      </div>

      {/* Assignees */}
      {event.assignees.length > 0 && (
        <div className="bg-[var(--c-gray)] rounded-3xl p-5">
          <h2 className="text-xs font-bold uppercase text-[#999] mb-3">Участники</h2>
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
                  className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5"
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: assignee.avatarColor }}
                  >
                    {initials}
                  </div>
                  <span className="text-sm font-bold text-[var(--c-black)]">{assignee.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-bold uppercase text-[var(--c-black)]">Удалить событие?</h3>
            <p className="mt-2 text-sm text-[#666]">
              Это действие нельзя отменить. Событие &laquo;{event.title}&raquo; будет удалено
              навсегда.
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)]/5 transition-all cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-bold uppercase text-white bg-[var(--c-coral)] hover:opacity-80 transition-all cursor-pointer",
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

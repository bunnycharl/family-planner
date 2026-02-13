"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  categoryId?: string | null;
  category?: { id: string; name: string; color: string } | null;
  assigneeId?: string | null;
}

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  onSave: () => void;
}

export function EventForm({ isOpen, onClose, event, defaultDate, onSave }: EventFormProps) {
  const { categories } = useCategories();
  const { data: users = [] } = useSWR<{ id: string; name: string }[]>("/api/users", fetcher);
  const isEditing = !!event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Custom category dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Custom assignee dropdown
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setCategoryId(event.categoryId ?? "");
      setDate(format(new Date(event.date), "yyyy-MM-dd"));
      setAssigneeId(event.assigneeId ?? "");
    } else {
      const d = defaultDate ?? new Date();
      setTitle("");
      setDescription("");
      setDate(format(d, "yyyy-MM-dd"));
      setCategoryId("");
      setAssigneeId("");
    }
  }, [isOpen, event, defaultDate]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    }
    if (categoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoryOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) {
        setAssigneeOpen(false);
      }
    }
    if (assigneeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [assigneeOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date + "T00:00:00").toISOString(),
      categoryId: categoryId || undefined,
      assigneeId: assigneeId || undefined,
    };

    try {
      const url = isEditing ? `/api/events/${event!.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save event");
      }

      toast.success(isEditing ? "Событие обновлено" : "Событие создано");
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!event) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success("Событие удалено");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось удалить событие");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (!isOpen) return null;

  const selectedCategory = categories.find((c: { id: string }) => c.id === categoryId) as
    | { id: string; name: string; color: string }
    | undefined;

  const selectedAssignee = users.find((u) => u.id === assigneeId);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal — full screen on mobile, centered card on desktop */}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-white flex flex-col",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:max-w-lg md:w-full md:rounded-3xl md:shadow-xl md:max-h-[90vh]"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-lavender)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold uppercase text-[var(--c-black)]">
                {isEditing ? "Редактировать" : "Новое событие"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#999] hover:bg-[var(--c-gray)] hover:text-[var(--c-black)] transition-all cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="event-title"
                className="block text-xs font-bold uppercase text-[#999] mb-1.5"
              >
                Название <span className="text-[var(--c-coral)]">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название события"
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="block text-xs font-bold uppercase text-[#999] mb-1.5"
              >
                Описание
              </label>
              <textarea
                id="event-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание события"
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm resize-none text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="event-date"
                className="block text-xs font-bold uppercase text-[#999] mb-1.5"
              >
                Дата
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30 [&::-webkit-date-and-time-value]:text-left"
              />
            </div>

            {/* Category — custom dropdown */}
            <div>
              <span className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Категория
              </span>
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="flex w-full items-center justify-between rounded-2xl border-2 border-[var(--c-black)] px-4 py-2.5 text-sm bg-white text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedCategory ? (
                      <>
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="text-[var(--c-black)]">{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="text-[#999]">Без категории</span>
                    )}
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#999] transition-transform",
                      categoryOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-2xl border-2 border-[var(--c-black)] bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId("");
                        setCategoryOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                        !categoryId
                          ? "bg-[var(--c-yellow)] text-[var(--c-black)] font-bold"
                          : "text-[#666] hover:bg-[var(--c-gray)]"
                      )}
                    >
                      <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-[#999]" />
                      Без категории
                    </button>
                    {categories.map((cat: { id: string; name: string; color: string }) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          setCategoryOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                          categoryId === cat.id
                            ? "bg-[var(--c-yellow)] text-[var(--c-black)] font-bold"
                            : "text-[#666] hover:bg-[var(--c-gray)]"
                        )}
                      >
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assignee — custom dropdown */}
            <div>
              <span className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Ответственный
              </span>
              <div className="relative" ref={assigneeRef}>
                <button
                  type="button"
                  onClick={() => setAssigneeOpen(!assigneeOpen)}
                  className="flex w-full items-center justify-between rounded-2xl border-2 border-[var(--c-black)] px-4 py-2.5 text-sm bg-white text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
                >
                  <span className="truncate">
                    {selectedAssignee ? (
                      <span className="text-[var(--c-black)]">{selectedAssignee.name}</span>
                    ) : (
                      <span className="text-[#999]">Не назначен</span>
                    )}
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#999] transition-transform",
                      assigneeOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {assigneeOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-2xl border-2 border-[var(--c-black)] bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeId("");
                        setAssigneeOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                        !assigneeId
                          ? "bg-[var(--c-yellow)] text-[var(--c-black)] font-bold"
                          : "text-[#666] hover:bg-[var(--c-gray)]"
                      )}
                    >
                      Не назначен
                    </button>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setAssigneeId(u.id);
                          setAssigneeOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                          assigneeId === u.id
                            ? "bg-[var(--c-yellow)] text-[var(--c-black)] font-bold"
                            : "text-[#666] hover:bg-[var(--c-gray)]"
                        )}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer — always visible at bottom */}
          <div className="flex items-center gap-3 p-4 pb-6 shrink-0 bg-white md:pb-4">
            {isEditing && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-full px-4 py-2.5 text-sm font-bold uppercase text-[var(--c-coral)] border-2 border-[var(--c-coral)] hover:bg-[var(--c-coral)]/10 transition-all cursor-pointer"
              >
                Удалить
              </button>
            )}
            {showDeleteConfirm ? (
              <>
                <span className="flex-1 text-sm font-bold uppercase text-[var(--c-coral)]">
                  Удалить событие?
                </span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
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
                  {isDeleting ? "Удаление..." : "Да, удалить"}
                </button>
              </>
            ) : (
              <>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-full px-6 py-2.5 text-sm font-bold uppercase text-white bg-[var(--c-black)] hover:opacity-80 transition-all cursor-pointer",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? "Сохранение..." : isEditing ? "Сохранить" : "Создать"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string; color: string } | null;
  isCompleted?: boolean;
  color?: string | null;
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
  const isEditing = !!event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Custom category dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setLocation(event.location ?? "");
      setCategoryId(event.categoryId ?? "");
      setStartDate(format(new Date(event.startDate), "yyyy-MM-dd"));
      setIsCompleted(event.isCompleted ?? false);
      setColor(event.color ?? null);
    } else {
      const d = defaultDate ?? new Date();
      setTitle("");
      setDescription("");
      setStartDate(format(d, "yyyy-MM-dd"));
      setCategoryId("");
      setLocation("");
      setIsCompleted(false);
      setColor(null);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: new Date(startDate + "T00:00:00").toISOString(),
      categoryId: categoryId || undefined,
      location: location.trim() || undefined,
      isCompleted,
      color: color || undefined,
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

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — full screen on mobile, centered card on desktop */}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-[var(--color-bg-card)] flex flex-col",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:max-w-lg md:w-full md:rounded-2xl md:shadow-xl md:max-h-[90vh] md:border md:border-[var(--color-border)]"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]">
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
              <h2 className="text-lg font-bold text-[var(--color-text)]">
                {isEditing ? "Редактировать событие" : "Новое событие"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-all cursor-pointer"
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
                className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Название <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название события"
                className={cn(
                  "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm",
                  "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                )}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Описание
              </label>
              <textarea
                id="event-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание события"
                className={cn(
                  "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm resize-none",
                  "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                )}
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="event-start"
                className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Дата
              </label>
              <input
                id="event-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(
                  "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm",
                  "text-[var(--color-text)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
                  "[&::-webkit-date-and-time-value]:text-left"
                )}
              />
            </div>

            {/* Category — custom dropdown */}
            <div>
              <span className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Категория
              </span>
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border-2 border-[var(--color-border)] px-4 py-2.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
                    "bg-[var(--color-bg)] text-left transition-all cursor-pointer"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedCategory ? (
                      <>
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="text-[var(--color-text)]">{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Без категории</span>
                    )}
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform",
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
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId("");
                        setCategoryOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                        !categoryId
                          ? "bg-[var(--color-primary-50)] text-[var(--color-primary)] font-semibold"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                      )}
                    >
                      <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-[var(--color-text-muted)]" />
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
                            ? "bg-[var(--color-primary-50)] text-[var(--color-primary)] font-semibold"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
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

            {/* Location */}
            <div>
              <label
                htmlFor="event-location"
                className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Место
              </label>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Место проведения"
                className={cn(
                  "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm",
                  "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                )}
              />
            </div>

            {/* Color picker with flag icon */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[var(--color-text-muted)]"
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
                  Цвет (флажок)
                </span>
              </label>
              <ColorPicker
                value={color ?? "#0d9488"}
                onChange={(c) => setColor(c)}
                showNone
                onNone={() => setColor(null)}
                isNone={color === null}
              />
            </div>

            {/* Completed checkbox (only when editing) */}
            {isEditing && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                <input
                  id="event-completed"
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <label
                  htmlFor="event-completed"
                  className="text-sm font-medium text-[var(--color-text)] cursor-pointer"
                >
                  Выполнено
                </label>
              </div>
            )}
          </div>

          {/* Footer — always visible at bottom */}
          <div className="flex items-center gap-3 p-4 pb-6 border-t border-[var(--color-border)] shrink-0 bg-[var(--color-bg-card)] md:pb-4">
            {isEditing && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-error)] bg-[var(--color-bg-card)] border-2 border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/10 transition-all cursor-pointer"
              >
                Удалить
              </button>
            )}
            {showDeleteConfirm ? (
              <>
                <span className="flex-1 text-sm font-medium text-[var(--color-error)]">
                  Удалить событие?
                </span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg)] border-2 border-[var(--color-border)] hover:bg-[var(--color-border-light)] transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-error)] hover:bg-red-700 transition-all cursor-pointer",
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
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg)] border-2 border-[var(--color-border)] hover:bg-[var(--color-border-light)] transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer",
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

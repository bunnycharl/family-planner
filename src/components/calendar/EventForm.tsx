"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

const PRESET_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f97316",
  "#ec4899",
  "#6b7280",
];

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

export function EventForm({
  isOpen,
  onClose,
  event,
  defaultDate,
  onSave,
}: EventFormProps) {
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

      toast.success(
        isEditing ? "Событие обновлено" : "Событие создано"
      );
      onSave();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ошибка сохранения"
      );
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

  const selectedCategory = categories.find(
    (c: { id: string }) => c.id === categoryId
  ) as { id: string; name: string; color: string } | undefined;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal — full screen on mobile, centered card on desktop */}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-white flex flex-col",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:max-w-lg md:w-full md:rounded-lg md:shadow-xl md:max-h-[90vh]"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Редактировать событие" : "Новое событие"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="event-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Название *
              </label>
              <input
                id="event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название события"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Описание
              </label>
              <textarea
                id="event-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание события"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="event-start"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Дата
              </label>
              <input
                id="event-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category — custom dropdown */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </span>
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-base",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                    "bg-white text-left"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedCategory ? (
                      <>
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="text-gray-900">
                          {selectedCategory.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">Без категории</span>
                    )}
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 shrink-0 text-gray-400 transition-transform",
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
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId("");
                        setCategoryOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors",
                        !categoryId
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-gray-300" />
                      Без категории
                    </button>
                    {categories.map(
                      (cat: { id: string; name: string; color: string }) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setCategoryOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors",
                            categoryId === cat.id
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <span
                            className="inline-block h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="event-location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Место
              </label>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Место проведения"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Color picker with flag icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-gray-500"
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setColor(null)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                    color === null
                      ? "border-indigo-500 ring-2 ring-offset-2 ring-indigo-300"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  title="Без цвета"
                >
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color === c
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Completed checkbox (only when editing) */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  id="event-completed"
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="event-completed"
                  className="text-base text-gray-700"
                >
                  Выполнено
                </label>
              </div>
            )}
          </div>

          {/* Footer — always visible at bottom */}
          <div className="flex items-center gap-2 p-4 pb-6 border-t shrink-0 bg-white md:pb-4">
            {isEditing && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 text-base font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
              >
                Удалить
              </button>
            )}
            {showDeleteConfirm ? (
              <>
                <span className="flex-1 text-sm text-red-600">
                  Удалить событие?
                </span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={cn(
                    "px-4 py-2.5 text-base font-medium text-white bg-red-600 rounded-md hover:bg-red-700",
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
                  className="px-4 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-4 py-2.5 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSubmitting
                    ? "Сохранение..."
                    : isEditing
                      ? "Сохранить"
                      : "Создать"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

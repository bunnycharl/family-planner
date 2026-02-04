"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TaskFormTask {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  categoryId?: string | null;
  assigneeId?: string | null;
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskFormTask | null;
  defaultStatus?: "TODO" | "IN_PROGRESS" | "DONE";
  onSave: () => void;
}

const STATUS_OPTIONS = [
  { value: "TODO", label: "К выполнению" },
  { value: "IN_PROGRESS", label: "В процессе" },
  { value: "DONE", label: "Готово" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Низкий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "HIGH", label: "Высокий" },
] as const;


// Reusable custom dropdown
function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; color?: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-base",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            "bg-white text-left"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                {selected.color && (
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: selected.color }}
                  />
                )}
                <span className="text-gray-900">{selected.label}</span>
              </>
            ) : (
              <span className="text-gray-500">
                {placeholder || "Выбрать..."}
              </span>
            )}
          </span>
          <svg
            className={cn(
              "h-4 w-4 shrink-0 text-gray-400 transition-transform",
              open && "rotate-180"
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

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors",
                  value === opt.value
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {opt.color && (
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskForm({
  isOpen,
  onClose,
  task,
  defaultStatus,
  onSave,
}: TaskFormProps) {
  const { categories } = useCategories();
  const { data: users = [] } = useSWR<{ id: string; name: string }[]>("/api/users", fetcher);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] =
    useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [priority, setPriority] =
    useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description ?? "");
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(
          task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : ""
        );
        setCategoryId(task.categoryId ?? "");
        setAssigneeId(task.assigneeId ?? "");
      } else {
        setTitle("");
        setDescription("");
        setStatus(defaultStatus ?? "TODO");
        setPriority("MEDIUM");
        setDueDate("");
        setCategoryId("");
        setAssigneeId("");
      }
    }
  }, [isOpen, task, defaultStatus]);

  if (!isOpen) return null;

  const isEditing = !!task;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Название обязательно");
      return;
    }

    setIsSubmitting(true);

    const body = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || undefined,
      assigneeId: assigneeId || undefined,
    };

    try {
      const url = isEditing ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success(isEditing ? "Задача обновлена" : "Задача создана");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось сохранить задачу");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!task) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success("Задача удалена");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось удалить задачу");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const categoryOptions = [
    { value: "", label: "Без категории", color: "#9ca3af" },
    ...categories.map(
      (cat: { id: string; name: string; color: string }) => ({
        value: cat.id,
        label: cat.name,
        color: cat.color,
      })
    ),
  ];

  const assigneeOptions = [
    { value: "", label: "Не назначен" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal — full screen on mobile */}
      <div
        className={cn(
          "absolute inset-0 z-10 bg-white flex flex-col",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:max-w-lg md:w-full md:rounded-xl md:shadow-xl md:max-h-[90vh]"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Редактировать задачу" : "Новая задача"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название задачи"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание задачи"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Status & Priority row */}
            <div className="grid grid-cols-2 gap-3">
              <CustomSelect
                label="Статус"
                value={status}
                options={STATUS_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                onChange={(v) =>
                  setStatus(v as "TODO" | "IN_PROGRESS" | "DONE")
                }
              />
              <CustomSelect
                label="Приоритет"
                value={priority}
                options={PRIORITY_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                onChange={(v) => setPriority(v as "LOW" | "MEDIUM" | "HIGH")}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Срок
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category */}
            <CustomSelect
              label="Категория"
              value={categoryId}
              options={categoryOptions}
              onChange={setCategoryId}
              placeholder="Без категории"
            />

            {/* Assignee */}
            <CustomSelect
              label="Исполнитель"
              value={assigneeId}
              options={assigneeOptions}
              onChange={setAssigneeId}
              placeholder="Не назначен"
            />
          </div>

          {/* Footer — always visible */}
          <div className="flex gap-3 p-4 pb-6 border-t shrink-0 bg-white md:pb-4">
            {isEditing && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-red-300 px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-50"
              >
                Удалить
              </button>
            )}
            {showDeleteConfirm ? (
              <>
                <span className="flex-1 flex items-center text-sm text-red-600">
                  Удалить задачу?
                </span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-base font-medium text-white",
                    "bg-red-600 hover:bg-red-700",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {isDeleting ? "Удаление..." : "Да, удалить"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "rounded-lg border border-gray-300 px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50",
                    !isEditing && "flex-1"
                  )}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2.5 text-base font-medium text-white",
                    "bg-indigo-600 hover:bg-indigo-700",
                    "disabled:cursor-not-allowed disabled:opacity-50"
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

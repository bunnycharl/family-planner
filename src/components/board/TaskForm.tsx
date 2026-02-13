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
  startDate?: string | null;
  endDate?: string | null;
  phaseId?: string | null;
  categoryId?: string | null;
  assigneeId?: string | null;
  showOnRoadmap?: boolean;
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
      <span className="mb-1.5 block text-xs font-bold uppercase text-[#999]">{label}</span>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-[var(--c-black)] px-4 py-2.5 text-sm bg-white text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
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
                <span className="text-[var(--c-black)]">{selected.label}</span>
              </>
            ) : (
              <span className="text-[#999]">{placeholder || "Выбрать..."}</span>
            )}
          </span>
          <svg
            className={cn(
              "h-4 w-4 shrink-0 text-[#999] transition-transform",
              open && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-2xl border-2 border-[var(--c-black)] bg-white shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                  value === opt.value
                    ? "bg-[var(--c-yellow)] text-[var(--c-black)] font-bold"
                    : "text-[#666] hover:bg-[var(--c-gray)]"
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

export function TaskForm({ isOpen, onClose, task, defaultStatus, onSave }: TaskFormProps) {
  const { categories } = useCategories();
  const { data: users = [] } = useSWR<{ id: string; name: string }[]>("/api/users", fetcher);
  const { data: phases = [] } = useSWR<{ id: string; name: string; emoji: string | null }[]>(
    "/api/roadmap/phases",
    fetcher
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [showOnRoadmap, setShowOnRoadmap] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description ?? "");
        setStatus(task.status);
        setStartDate(task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "");
        setEndDate(task.endDate ? new Date(task.endDate).toISOString().split("T")[0] : "");
        setPhaseId(task.phaseId ?? "");
        setCategoryId(task.categoryId ?? "");
        setAssigneeId(task.assigneeId ?? "");
        setShowOnRoadmap(task.showOnRoadmap ?? false);
      } else {
        setTitle("");
        setDescription("");
        setStatus(defaultStatus ?? "TODO");
        setStartDate("");
        setEndDate("");
        setPhaseId("");
        setCategoryId("");
        setAssigneeId("");
        setShowOnRoadmap(false);
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

    if (showOnRoadmap && !phaseId) {
      toast.error("Выберите фазу для отображения на роадмапе");
      return;
    }

    setIsSubmitting(true);

    const body = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      showOnRoadmap,
      phaseId: showOnRoadmap ? phaseId || undefined : undefined,
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
    ...categories.map((cat: { id: string; name: string; color: string }) => ({
      value: cat.id,
      label: cat.name,
      color: cat.color,
    })),
  ];

  const assigneeOptions = [
    { value: "", label: "Не назначен" },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const phaseOptions = [
    { value: "", label: "Выберите фазу" },
    ...phases.map((p) => ({
      value: p.id,
      label: `${p.emoji ? p.emoji + " " : ""}${p.name}`,
    })),
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
          "md:max-w-lg md:w-full md:rounded-3xl md:shadow-xl md:max-h-[90vh]"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-mint)]">
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
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold uppercase text-[var(--c-black)]">
                {isEditing ? "Редактировать" : "Новая задача"}
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
              <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Название <span className="text-[var(--c-coral)]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название задачи"
                required
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание задачи"
                rows={3}
                className="w-full resize-none rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            {/* Status */}
            <CustomSelect
              label="Статус"
              value={status}
              options={STATUS_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              onChange={(v) => setStatus(v as "TODO" | "IN_PROGRESS" | "DONE")}
            />

            {/* Start Date & End Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                  Начало
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30 [&::-webkit-date-and-time-value]:text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">Срок</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30 [&::-webkit-date-and-time-value]:text-left"
                />
              </div>
            </div>

            {/* Show on Roadmap */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowOnRoadmap(!showOnRoadmap);
                  if (showOnRoadmap) setPhaseId("");
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                    showOnRoadmap
                      ? "border-[var(--c-lavender)] bg-[var(--c-lavender)]"
                      : "border-[#ccc] group-hover:border-[var(--c-lavender)]"
                  )}
                >
                  {showOnRoadmap && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-bold uppercase text-[var(--c-black)]">
                  Отображать на роадмапе
                </span>
              </button>
            </div>

            {/* Phase (only when showOnRoadmap) */}
            {showOnRoadmap && (
              <CustomSelect
                label="Фаза роадмапа"
                value={phaseId}
                options={phaseOptions}
                onChange={setPhaseId}
                placeholder="Выберите фазу"
              />
            )}

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
          <div className="flex gap-3 p-4 pb-6 shrink-0 bg-white md:pb-4">
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
                <span className="flex-1 flex items-center text-sm font-bold uppercase text-[var(--c-coral)]">
                  Удалить задачу?
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
                    "rounded-full px-5 py-2.5 text-sm font-bold uppercase text-white",
                    "bg-[var(--c-coral)] hover:opacity-80 transition-all cursor-pointer",
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
                    "rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer",
                    !isEditing && "flex-1"
                  )}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 rounded-full px-6 py-2.5 text-sm font-bold uppercase text-white",
                    "bg-[var(--c-black)] hover:opacity-80 transition-all cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-50"
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

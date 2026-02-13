"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

interface Milestone {
  id: string;
  name: string;
  details: string | null;
  category: { id: string; name: string; color: string; icon?: string | null } | null;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  position: number;
  phaseId: string;
}

interface RoadmapPhase {
  id: string;
  name: string;
  emoji: string | null;
  position: number;
}

interface MilestoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone?: Milestone | null;
  phases: RoadmapPhase[];
  defaultPhaseId?: string | null;
  onSave: () => void;
}

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

export function MilestoneFormModal({
  isOpen,
  onClose,
  milestone,
  phases,
  defaultPhaseId,
  onSave,
}: MilestoneFormModalProps) {
  const { categories } = useCategories();

  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!milestone;

  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        setName(milestone.name);
        setDetails(milestone.details ?? "");
        setCategoryId(milestone.category?.id ?? "");
        setStartDate(new Date(milestone.startDate).toISOString().split("T")[0]);
        setEndDate(new Date(milestone.endDate).toISOString().split("T")[0]);
        setPhaseId(milestone.phaseId);
        setIsCompleted(milestone.isCompleted);
      } else {
        setName("");
        setDetails("");
        setCategoryId("");
        setStartDate("");
        setEndDate("");
        setPhaseId(defaultPhaseId || (phases.length > 0 ? phases[0].id : ""));
        setIsCompleted(false);
      }
      setShowDeleteConfirm(false);
    }
  }, [isOpen, milestone, defaultPhaseId, phases]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Название обязательно");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Укажите даты начала и окончания");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("Дата окончания не может быть раньше начала");
      return;
    }
    if (!phaseId) {
      toast.error("Выберите фазу");
      return;
    }

    setIsSubmitting(true);

    const body = {
      name: name.trim(),
      details: details.trim() || undefined,
      categoryId: categoryId || null,
      startDate,
      endDate,
      phaseId,
      isCompleted,
    };

    try {
      const url = isEditing
        ? `/api/roadmap/milestones/${milestone!.id}`
        : "/api/roadmap/milestones";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(isEditing ? "Веха обновлена" : "Веха создана");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось сохранить веху");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!milestone) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/roadmap/milestones/${milestone.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success("Веха удалена");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось удалить веху");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const phaseOptions = phases
    .sort((a, b) => a.position - b.position)
    .map((p) => ({
      value: p.id,
      label: `${p.emoji ? p.emoji + " " : ""}${p.name}`,
    }));

  const categoryOptions: { value: string; label: string; color?: string }[] = [
    { value: "", label: "Без категории" },
    ...categories.map((c: { id: string; name: string; color: string }) => ({
      value: c.id,
      label: c.name,
      color: c.color,
    })),
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

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
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold uppercase text-[var(--c-black)]">
                {isEditing ? "Редактировать веху" : "Новая веха"}
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
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Название <span className="text-[var(--c-coral)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название вехи"
                required
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Описание
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Подробности вехи"
                rows={3}
                className="w-full resize-none rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            {/* Category & Phase */}
            <div className="grid grid-cols-2 gap-3">
              <CustomSelect
                label="Категория"
                value={categoryId}
                options={categoryOptions}
                onChange={setCategoryId}
                placeholder="Выбрать категорию"
              />
              <CustomSelect
                label="Фаза"
                value={phaseId}
                options={phaseOptions}
                onChange={setPhaseId}
                placeholder="Выбрать фазу"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                  Начало <span className="text-[var(--c-coral)]">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30 [&::-webkit-date-and-time-value]:text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                  Окончание <span className="text-[var(--c-coral)]">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30 [&::-webkit-date-and-time-value]:text-left"
                />
              </div>
            </div>

            {/* Completed — only when editing */}
            {isEditing && (
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all",
                    isCompleted ? "border-[var(--c-mint)] bg-[var(--c-mint)]" : "border-[#ccc]"
                  )}
                  onClick={() => setIsCompleted(!isCompleted)}
                >
                  {isCompleted && (
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-bold uppercase text-[#999]">Выполнено</span>
              </label>
            )}
          </div>

          {/* Footer */}
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
                  Удалить веху?
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

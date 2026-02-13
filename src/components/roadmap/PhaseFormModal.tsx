"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoadmapPhase {
  id: string;
  name: string;
  emoji: string | null;
  position: number;
}

interface PhaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase?: RoadmapPhase | null;
  onSave: () => void;
}

export function PhaseFormModal({ isOpen, onClose, phase, onSave }: PhaseFormModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!phase;

  useEffect(() => {
    if (isOpen) {
      if (phase) {
        setName(phase.name);
        setEmoji(phase.emoji ?? "");
      } else {
        setName("");
        setEmoji("");
      }
      setShowDeleteConfirm(false);
    }
  }, [isOpen, phase]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Название обязательно");
      return;
    }

    setIsSubmitting(true);

    const body = {
      name: name.trim(),
      emoji: emoji.trim() || undefined,
    };

    try {
      const url = isEditing ? `/api/roadmap/phases/${phase!.id}` : "/api/roadmap/phases";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(isEditing ? "Фаза обновлена" : "Фаза создана");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось сохранить фазу");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!phase) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/roadmap/phases/${phase.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success("Фаза удалена");
      onSave();
      onClose();
    } catch {
      toast.error("Не удалось удалить фазу");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

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
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold uppercase text-[var(--c-black)]">
                {isEditing ? "Редактировать фазу" : "Новая фаза"}
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">
                Название <span className="text-[var(--c-coral)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название фазы"
                required
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#999] mb-1.5">Эмодзи</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🇪🇸"
                className="w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-2.5 text-sm text-[var(--c-black)] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[var(--c-lavender)]/30"
              />
            </div>
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
                  Удалить фазу и все задачи?
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

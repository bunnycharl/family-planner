"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

export default function SettingsPage() {
  const { categories, isLoading, mutate } = useCategories();

  // Add form state
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create category");
      }

      toast.success("Категория создана");
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ошибка создания категории"
      );
    } finally {
      setIsAdding(false);
    }
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update category");
      }

      toast.success("Категория обновлена");
      cancelEditing();
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ошибка обновления категории"
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete category");
      }

      toast.success("Категория удалена");
      setDeletingId(null);
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Ошибка удаления категории"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Page title */}
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
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Настройки</h1>
      </div>

      {/* Categories management */}
      <section className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="h-5 w-5 text-[var(--color-primary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Категории
          </h2>
        </div>

        {/* Categories list */}
        <>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-[var(--color-bg)] rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Категорий пока нет. Создайте первую!
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {categories.map((category: Category) => (
              <div key={category.id}>
                {editingId === category.id ? (
                  /* Editing mode */
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-[var(--color-primary)]/30 bg-[var(--color-primary-50)] p-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={cn(
                        "flex-1 min-w-[120px] rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm",
                        "text-[var(--color-text)]",
                        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                      )}
                      autoFocus
                    />

                    {/* Color swatches */}
                    <div className="flex items-center gap-1.5">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={cn(
                            "h-7 w-7 rounded-lg border-2 transition-all cursor-pointer",
                            editColor === color
                              ? "border-[var(--color-text)] scale-110 ring-2 ring-offset-1 ring-[var(--color-text)]/20"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Цвет ${color}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit || !editName.trim()}
                        className={cn(
                          "rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer",
                          "text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-all",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isSavingEdit ? "..." : "Сохранить"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-all hover:border-[var(--color-primary)]/30">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-5 w-5 rounded-lg shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-semibold text-[var(--color-text)]">
                        {category.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(category)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] transition-all cursor-pointer"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(category.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all cursor-pointer"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add category form */}
        <form
          onSubmit={handleAddCategory}
          className="border-t border-[var(--color-border)] pt-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Добавить категорию
          </h3>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <label
                htmlFor="new-category-name"
                className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5"
              >
                Название
              </label>
              <input
                id="new-category-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название категории"
                className={cn(
                  "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm",
                  "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={isAdding || !newName.trim()}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer",
                "text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isAdding ? "Создание..." : "Добавить"}
            </button>
          </div>

          {/* Color picker row */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
              Цвет
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={cn(
                    "h-8 w-8 rounded-lg border-2 transition-all cursor-pointer",
                    newColor === color
                      ? "border-[var(--color-text)] scale-110 ring-2 ring-offset-1 ring-[var(--color-text)]/20"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Цвет ${color}`}
                />
              ))}
            </div>
          </div>
        </form>
        </>
      </section>

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 shadow-xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-error)]/10">
                <svg className="h-5 w-5 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Удалить категорию?
              </h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">
              Это действие нельзя отменить. Категория будет удалена навсегда.
              События с этой категорией не будут удалены.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-border-light)] transition-all cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-error)] hover:bg-red-700 transition-all cursor-pointer",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isDeleting ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

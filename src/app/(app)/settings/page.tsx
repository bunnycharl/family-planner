"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

export default function SettingsPage() {
  return (
    <ErrorBoundary featureName="Настройки">
      <SettingsContent />
    </ErrorBoundary>
  );
}

function SettingsContent() {
  const { categories, isLoading, mutate } = useCategories();

  // Add form state
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#ef4444");
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
      setNewColor("#ef4444");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка создания категории");
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
      toast.error(err instanceof Error ? err.message : "Ошибка обновления категории");
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
      toast.error(err instanceof Error ? err.message : "Ошибка удаления категории");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
        <span className="bg-[var(--c-lavender)] px-4 py-1 rounded-xl inline-block text-white">
          Настройки
        </span>
      </h1>

      {/* Categories management */}
      <section className="bg-[var(--c-gray)] rounded-3xl p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[var(--c-black)] text-white rounded-full px-3 py-1 text-xs font-bold uppercase">
            Категории
          </span>
        </div>

        {/* Categories list */}
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-[var(--c-lavender)]" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-[#ccc]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p className="text-sm font-bold uppercase text-[#999]">
                Категорий пока нет. Создайте первую!
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {categories.map((category: Category) => (
                <div key={category.id}>
                  {editingId === category.id ? (
                    /* Editing mode */
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={cn(
                          "flex-1 min-w-[120px] rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-3 text-sm font-medium",
                          "text-[var(--c-black)]",
                          "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]"
                        )}
                        autoFocus
                      />

                      {/* Color picker */}
                      <ColorPicker value={editColor} onChange={setEditColor} />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={isSavingEdit || !editName.trim()}
                          className={cn(
                            "rounded-full px-5 py-2.5 text-sm font-bold uppercase cursor-pointer",
                            "text-white bg-[var(--c-black)] hover:opacity-80 transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {isSavingEdit ? "..." : "Сохранить"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)]/5 transition-all cursor-pointer"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <div className="flex items-center justify-between rounded-2xl bg-white p-4 transition-all hover:-translate-y-0.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-block h-5 w-5 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-bold uppercase text-[var(--c-black)]">
                          {category.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(category)}
                          className="rounded-full px-4 py-1.5 text-xs font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-yellow)] transition-all cursor-pointer"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(category.id)}
                          className="rounded-full px-4 py-1.5 text-xs font-bold uppercase text-[var(--c-coral)] hover:bg-[var(--c-coral)]/10 transition-all cursor-pointer"
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
          <form onSubmit={handleAddCategory} className="border-t-2 border-white pt-5 space-y-4">
            <h3 className="text-sm font-bold uppercase text-[var(--c-black)]">
              Добавить категорию
            </h3>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label
                  htmlFor="new-category-name"
                  className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-1.5"
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
                    "w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-3 text-sm font-medium",
                    "text-[var(--c-black)] placeholder:text-[#bbb]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]"
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={isAdding || !newName.trim()}
                className={cn(
                  "rounded-full px-6 py-3 text-sm font-bold uppercase cursor-pointer",
                  "text-white bg-[var(--c-black)] hover:opacity-80 transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isAdding ? "Создание..." : "Добавить"}
              </button>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-2">
                Цвет
              </label>
              <ColorPicker value={newColor} onChange={setNewColor} />
            </div>
          </form>
        </>
      </section>

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-coral)]">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold uppercase text-[var(--c-black)]">
                Удалить категорию?
              </h3>
            </div>
            <p className="text-sm text-[#666] mb-5">
              Это действие нельзя отменить. Категория будет удалена навсегда. События с этой
              категорией не будут удалены.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-full border-2 border-[var(--c-black)] px-5 py-2.5 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-black)]/5 transition-all cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
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
    </div>
  );
}

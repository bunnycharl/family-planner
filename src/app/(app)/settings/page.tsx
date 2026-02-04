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
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      {/* Categories management */}
      <section className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Категории
        </h2>

        {/* Categories list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            Категорий пока нет. Создайте первую!
          </p>
        ) : (
          <div className="space-y-2 mb-6">
            {categories.map((category: Category) => (
              <div key={category.id}>
                {editingId === category.id ? (
                  /* Editing mode */
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={cn(
                        "flex-1 min-w-[120px] rounded-md border border-gray-300 px-3 py-1.5 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      )}
                      autoFocus
                    />

                    {/* Color swatches */}
                    <div className="flex items-center gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 transition-transform",
                            editColor === color
                              ? "border-gray-800 scale-110"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Цвет ${color}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit || !editName.trim()}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm font-medium",
                          "text-white bg-indigo-600 hover:bg-indigo-700 transition-colors",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isSavingEdit ? "..." : "Сохранить"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-4 w-4 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(category)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(category.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          className="border-t pt-4 space-y-3"
        >
          <h3 className="text-sm font-medium text-gray-700">
            Добавить категорию
          </h3>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[160px]">
              <label
                htmlFor="new-category-name"
                className="block text-xs text-gray-500 mb-1"
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
                  "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={isAdding || !newName.trim()}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium",
                "text-white bg-indigo-600 hover:bg-indigo-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isAdding ? "Создание..." : "Добавить"}
            </button>
          </div>

          {/* Color picker row */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Цвет
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform",
                    newColor === color
                      ? "border-gray-800 scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Цвет ${color}`}
                />
              ))}
            </div>
          </div>
        </form>
      </section>

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Удалить категорию?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Это действие нельзя отменить. Категория будет удалена навсегда.
              События с этой категорией не будут удалены.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700",
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

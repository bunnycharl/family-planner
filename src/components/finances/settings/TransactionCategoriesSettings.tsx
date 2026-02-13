"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTransactionCategories } from "@/hooks/finances/useTransactionCategories";
import { useTransactionMutations } from "@/hooks/finances/useTransactionMutations";
import type { BudgetYearData } from "@/lib/finances/types";

const COLOR_PRESETS = [
  "#ff6b6b",
  "#45d9b4",
  "#a78bfa",
  "#ffd166",
  "#3b82f6",
  "#f97316",
  "#ec4899",
  "#14b8a6",
];

interface TransactionCategoriesSettingsProps {
  year: number;
  budgetData: BudgetYearData;
}

export function TransactionCategoriesSettings({
  year,
  budgetData,
}: TransactionCategoriesSettingsProps) {
  const { categories, mutate: mutateCategories } = useTransactionCategories(year);
  const mutations = useTransactionMutations(year, () => {}, mutateCategories);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);
  const [newMappingId, setNewMappingId] = useState<string>("");

  // Flatten budget expense categories for mapping selector
  const budgetExpenseCategories = budgetData.expenseGroups.flatMap((g) =>
    g.categories.map((c) => ({
      id: c.id,
      name: c.name,
      groupName: g.name,
    }))
  );

  async function handleAdd() {
    if (!newName.trim()) return;
    try {
      await mutations.createCategory({
        name: newName.trim(),
        color: newColor,
        expenseCategoryId: newMappingId || null,
      });
      setNewName("");
      setNewColor(COLOR_PRESETS[0]);
      setNewMappingId("");
      toast.success("Категория создана");
    } catch {
      toast.error("Ошибка при создании категории");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить категорию «${name}»? Все транзакции этой категории будут удалены.`))
      return;
    try {
      await mutations.deleteCategory(id);
      toast.success("Категория удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const mapping = budgetExpenseCategories.find((bc) => bc.id === cat.expenseCategoryId);
        return (
          <div key={cat.id} className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <h3 className="text-sm font-extrabold uppercase">{cat.name}</h3>
                {mapping && (
                  <span className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-[var(--c-black)]/40">
                    {mapping.groupName} → {mapping.name}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                className="rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        );
      })}

      {/* Add new category */}
      <div className="rounded-3xl border-2 border-dashed border-[var(--c-black)]/20 p-4 md:p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Добавить категорию расходов
        </h3>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Название категории..."
            className="flex-1 min-w-[160px] rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
          />
        </div>

        {/* Color picker */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">Цвет</p>
          <div className="flex gap-2 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewColor(color)}
                className={cn(
                  "h-8 w-8 rounded-full transition-all cursor-pointer",
                  newColor === color
                    ? "ring-2 ring-offset-2 ring-[var(--c-black)] scale-110"
                    : "hover:scale-110"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Budget category mapping */}
        {budgetExpenseCategories.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
              Связь с плановой категорией (для план vs факт)
            </p>
            <select
              value={newMappingId}
              onChange={(e) => setNewMappingId(e.target.value)}
              className="w-full rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors cursor-pointer"
            >
              <option value="">Без связи</option>
              {budgetExpenseCategories.map((bc) => (
                <option key={bc.id} value={bc.id}>
                  {bc.groupName} → {bc.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="rounded-2xl bg-[var(--c-lavender)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
        >
          Создать категорию
        </button>
      </div>
    </div>
  );
}

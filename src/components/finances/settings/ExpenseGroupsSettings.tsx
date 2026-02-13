"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BudgetYearData } from "@/lib/finances/types";

interface ExpenseGroupsSettingsProps {
  data: BudgetYearData;
  mutations: {
    createExpenseGroup: (data: { name: string; currency: string }) => Promise<void>;
    updateExpenseGroup: (id: string, data: { name?: string; currency?: string }) => Promise<void>;
    deleteExpenseGroup: (id: string) => Promise<void>;
    createExpenseCategory: (groupId: string, data: { name: string }) => Promise<void>;
    deleteExpenseCategory: (groupId: string, catId: string) => Promise<void>;
  };
}

export function ExpenseGroupsSettings({ data, mutations }: ExpenseGroupsSettingsProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCurrency, setNewGroupCurrency] = useState("RUB");
  const [newCategoryNames, setNewCategoryNames] = useState<Record<string, string>>({});

  async function handleAddGroup() {
    if (!newGroupName.trim()) return;
    try {
      await mutations.createExpenseGroup({
        name: newGroupName.trim(),
        currency: newGroupCurrency,
      });
      setNewGroupName("");
      setNewGroupCurrency("RUB");
      toast.success("Группа создана");
    } catch {
      toast.error("Ошибка при создании группы");
    }
  }

  async function handleDeleteGroup(id: string, name: string) {
    if (!confirm(`Удалить группу «${name}»? Все расходы этой группы будут удалены.`)) return;
    try {
      await mutations.deleteExpenseGroup(id);
      toast.success("Группа удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  async function handleAddCategory(groupId: string) {
    const name = newCategoryNames[groupId]?.trim();
    if (!name) return;
    try {
      await mutations.createExpenseCategory(groupId, { name });
      setNewCategoryNames((prev) => ({ ...prev, [groupId]: "" }));
      toast.success("Категория добавлена");
    } catch {
      toast.error("Ошибка при добавлении");
    }
  }

  async function handleDeleteCategory(groupId: string, catId: string) {
    try {
      await mutations.deleteExpenseCategory(groupId, catId);
      toast.success("Категория удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  return (
    <div className="space-y-4">
      {data.expenseGroups.map((group) => (
        <div key={group.id} className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-extrabold uppercase">{group.name}</h3>
              <span className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-[var(--c-black)]/40">
                {group.currency}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteGroup(group.id, group.name)}
              className="rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            >
              Удалить группу
            </button>
          </div>

          <div className="space-y-1.5">
            {group.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5"
              >
                <span className="text-sm font-medium">{cat.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(group.id, cat.id)}
                  className="text-xs font-bold text-[var(--c-coral)] hover:opacity-60 transition-opacity cursor-pointer"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryNames[group.id] ?? ""}
              onChange={(e) =>
                setNewCategoryNames((prev) => ({ ...prev, [group.id]: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory(group.id)}
              placeholder="Новая категория..."
              className="flex-1 rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
            />
            <button
              type="button"
              onClick={() => handleAddCategory(group.id)}
              disabled={!newCategoryNames[group.id]?.trim()}
              className="rounded-2xl bg-[var(--c-mint)] px-4 py-2 text-sm font-bold text-[var(--c-black)] hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
            >
              Добавить
            </button>
          </div>
        </div>
      ))}

      {/* Add new group */}
      <div className="rounded-3xl border-2 border-dashed border-[var(--c-black)]/20 p-4 md:p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Добавить группу расходов
        </h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
            placeholder="Название группы..."
            className="flex-1 min-w-[160px] rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
          />
          <select
            value={newGroupCurrency}
            onChange={(e) => setNewGroupCurrency(e.target.value)}
            className="rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors cursor-pointer"
          >
            <option value="RUB">RUB</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <button
            type="button"
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
            className="rounded-2xl bg-[var(--c-lavender)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
          >
            Создать группу
          </button>
        </div>
      </div>
    </div>
  );
}

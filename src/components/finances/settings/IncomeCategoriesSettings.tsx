"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BudgetYearData, IncomeCategoryType } from "@/lib/finances/types";
import { FormulaEditor } from "@/components/finances/shared/FormulaEditor";

interface IncomeCategoriesSettingsProps {
  data: BudgetYearData;
  mutations: {
    createIncomeCategory: (data: {
      userId: string;
      name: string;
      type: IncomeCategoryType;
      taxRateId?: string | null;
      formula?: string | null;
    }) => Promise<void>;
    updateIncomeCategory: (
      id: string,
      data: {
        name?: string;
        type?: IncomeCategoryType;
        taxRateId?: string | null;
        formula?: string | null;
      }
    ) => Promise<void>;
    deleteIncomeCategory: (id: string) => Promise<void>;
    createFormulaParam: (
      categoryId: string,
      data: { name: string; paramKey: string }
    ) => Promise<void>;
    deleteFormulaParam: (categoryId: string, paramId: string) => Promise<void>;
  };
}

export function IncomeCategoriesSettings({ data, mutations }: IncomeCategoriesSettingsProps) {
  const [selectedUserId, setSelectedUserId] = useState(data.incomeUsers[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<IncomeCategoryType>("FIXED");
  const [newTaxRateId, setNewTaxRateId] = useState<string>("");
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  const user = data.incomeUsers.find((u) => u.id === selectedUserId);
  const categories = user?.incomeCategories ?? [];

  async function handleAdd() {
    if (!newName.trim() || !selectedUserId) return;
    try {
      await mutations.createIncomeCategory({
        userId: selectedUserId,
        name: newName.trim(),
        type: newType,
        taxRateId: newTaxRateId || null,
      });
      setNewName("");
      setNewType("FIXED");
      setNewTaxRateId("");
      toast.success("Категория добавлена");
    } catch {
      toast.error("Ошибка при добавлении");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить «${name}»? Все записи доходов этой категории будут удалены.`)) return;
    try {
      await mutations.deleteIncomeCategory(id);
      toast.success("Категория удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  return (
    <div className="space-y-4">
      {/* User selector */}
      <div className="flex flex-wrap gap-2">
        {data.incomeUsers.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setSelectedUserId(u.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              selectedUserId === u.id
                ? "bg-[var(--c-lavender)] text-white"
                : "bg-[var(--c-gray)] text-[var(--c-black)] hover:bg-[var(--c-gray)]/80"
            )}
          >
            {u.name}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-3">
        {/* Categories list */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setExpandedCatId(expandedCatId === cat.id ? null : cat.id)}
                    className="text-xs cursor-pointer"
                  >
                    {expandedCatId === cat.id ? "▼" : "▶"}
                  </button>
                  <span className="text-sm font-semibold truncate">{cat.name}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                      cat.type === "FORMULA"
                        ? "bg-[var(--c-lavender)]/15 text-[var(--c-lavender)]"
                        : "bg-[var(--c-gray)] text-[var(--c-black)]/40"
                    )}
                  >
                    {cat.type === "FORMULA" ? "Формула" : "Фикс."}
                  </span>
                  {cat.taxRate && (
                    <span className="shrink-0 rounded-full bg-[var(--c-mint)]/15 px-2.5 py-0.5 text-[10px] font-bold text-[var(--c-mint)]">
                      {cat.taxRate.name}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="shrink-0 rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer ml-2"
                >
                  Удалить
                </button>
              </div>

              {/* Expanded: edit type, tax rate, formula */}
              {expandedCatId === cat.id && (
                <CategoryDetail cat={cat} taxRates={data.taxRates} mutations={mutations} />
              )}
            </div>
          ))}
        </div>

        {/* Add new category */}
        <div className="space-y-2 rounded-2xl border-2 border-dashed border-[var(--c-black)]/15 p-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Новая категория..."
              className="flex-1 min-w-[140px] rounded-xl border-2 border-[var(--c-black)]/10 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as IncomeCategoryType)}
              className="rounded-xl border-2 border-[var(--c-black)]/10 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[var(--c-lavender)] cursor-pointer"
            >
              <option value="FIXED">Фикс. сумма</option>
              <option value="FORMULA">Формула</option>
            </select>
            <select
              value={newTaxRateId}
              onChange={(e) => setNewTaxRateId(e.target.value)}
              className="rounded-xl border-2 border-[var(--c-black)]/10 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[var(--c-lavender)] cursor-pointer"
            >
              <option value="">Без налога</option>
              {data.taxRates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="rounded-xl bg-[var(--c-lavender)] px-4 py-2 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryDetail({
  cat,
  taxRates,
  mutations,
}: {
  cat: IncomeCategoriesSettingsProps["data"]["incomeUsers"][0]["incomeCategories"][0];
  taxRates: IncomeCategoriesSettingsProps["data"]["taxRates"];
  mutations: IncomeCategoriesSettingsProps["mutations"];
}) {
  const [newParamName, setNewParamName] = useState("");
  const [newParamKey, setNewParamKey] = useState("");

  async function handleTaxChange(taxRateId: string) {
    try {
      await mutations.updateIncomeCategory(cat.id, {
        taxRateId: taxRateId || null,
      });
    } catch {
      toast.error("Ошибка при обновлении");
    }
  }

  async function handleTypeChange(type: IncomeCategoryType) {
    try {
      await mutations.updateIncomeCategory(cat.id, { type });
    } catch {
      toast.error("Ошибка при обновлении");
    }
  }

  async function handleFormulaChange(formula: string) {
    try {
      await mutations.updateIncomeCategory(cat.id, { formula });
    } catch {
      toast.error("Ошибка при обновлении формулы");
    }
  }

  async function handleAddParam() {
    if (!newParamName.trim() || !newParamKey.trim()) return;
    try {
      await mutations.createFormulaParam(cat.id, {
        name: newParamName.trim(),
        paramKey: newParamKey.trim().toLowerCase().replace(/\s+/g, "_"),
      });
      setNewParamName("");
      setNewParamKey("");
      toast.success("Параметр добавлен");
    } catch {
      toast.error("Ошибка при добавлении параметра");
    }
  }

  async function handleDeleteParam(paramId: string) {
    try {
      await mutations.deleteFormulaParam(cat.id, paramId);
      toast.success("Параметр удалён");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  return (
    <div className="ml-6 space-y-3 rounded-2xl bg-white p-4">
      {/* Type and Tax Rate */}
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-[var(--c-black)]/40">Тип</label>
          <select
            value={cat.type}
            onChange={(e) => handleTypeChange(e.target.value as IncomeCategoryType)}
            className="rounded-xl border-2 border-[var(--c-black)]/10 bg-[var(--c-gray)] px-3 py-1.5 text-sm font-medium outline-none cursor-pointer"
          >
            <option value="FIXED">Фикс. сумма</option>
            <option value="FORMULA">Формула</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-[var(--c-black)]/40">Налог</label>
          <select
            value={cat.taxRateId ?? ""}
            onChange={(e) => handleTaxChange(e.target.value)}
            className="rounded-xl border-2 border-[var(--c-black)]/10 bg-[var(--c-gray)] px-3 py-1.5 text-sm font-medium outline-none cursor-pointer"
          >
            <option value="">Без налога</option>
            {taxRates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula section */}
      {cat.type === "FORMULA" && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase text-[var(--c-black)]/40">
            Параметры формулы
          </h4>

          {cat.params.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-[var(--c-gray)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{p.name}</span>
                <code className="rounded bg-[var(--c-lavender)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--c-lavender)]">
                  {p.paramKey}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteParam(p.id)}
                className="text-xs font-bold text-[var(--c-coral)] hover:opacity-60 transition-opacity cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newParamName}
              onChange={(e) => setNewParamName(e.target.value)}
              placeholder="Название (Клиентов)"
              className="flex-1 min-w-[120px] rounded-xl border-2 border-[var(--c-black)]/10 bg-[var(--c-gray)] px-3 py-2 text-sm outline-none focus:border-[var(--c-lavender)]"
            />
            <input
              type="text"
              value={newParamKey}
              onChange={(e) => setNewParamKey(e.target.value)}
              placeholder="Ключ (clients)"
              className="w-32 rounded-xl border-2 border-[var(--c-black)]/10 bg-[var(--c-gray)] px-3 py-2 text-sm font-mono outline-none focus:border-[var(--c-lavender)]"
            />
            <button
              type="button"
              onClick={handleAddParam}
              disabled={!newParamName.trim() || !newParamKey.trim()}
              className="rounded-xl bg-[var(--c-mint)] px-3 py-2 text-sm font-bold text-[var(--c-black)] hover:opacity-80 cursor-pointer disabled:opacity-40"
            >
              + Параметр
            </button>
          </div>

          <FormulaEditor
            formula={cat.formula ?? ""}
            availableParams={cat.params.map((p) => ({
              paramKey: p.paramKey,
              name: p.name,
            }))}
            onChange={handleFormulaChange}
          />
        </div>
      )}
    </div>
  );
}

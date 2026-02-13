"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BudgetYearData } from "@/lib/finances/types";

interface TaxRatesSettingsProps {
  data: BudgetYearData;
  mutations: {
    createTaxRate: (data: { name: string; rate: number }) => Promise<void>;
    updateTaxRate: (id: string, data: { name?: string; rate?: number }) => Promise<void>;
    deleteTaxRate: (id: string) => Promise<void>;
  };
}

export function TaxRatesSettings({ data, mutations }: TaxRatesSettingsProps) {
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");

  async function handleAdd() {
    if (!newName.trim() || !newRate) return;
    const rate = parseFloat(newRate) / 100;
    if (isNaN(rate) || rate < 0 || rate > 1) {
      toast.error("Ставка должна быть от 0 до 100%");
      return;
    }
    try {
      await mutations.createTaxRate({ name: newName.trim(), rate });
      setNewName("");
      setNewRate("");
      toast.success("Ставка добавлена");
    } catch {
      toast.error("Ошибка при добавлении");
    }
  }

  async function handleDelete(id: string) {
    try {
      await mutations.deleteTaxRate(id);
      toast.success("Ставка удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }

  async function handleRateChange(id: string, newRateStr: string) {
    const rate = parseFloat(newRateStr) / 100;
    if (isNaN(rate)) return;
    try {
      await mutations.updateTaxRate(id, { rate });
    } catch {
      toast.error("Ошибка при обновлении");
    }
  }

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        Налоговые ставки
      </h3>

      <div className="space-y-2">
        {data.taxRates.map((rate) => (
          <div
            key={rate.id}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{rate.name}</span>
              <input
                type="number"
                defaultValue={Math.round(rate.rate * 100)}
                onBlur={(e) => handleRateChange(rate.id, e.target.value)}
                className="w-16 rounded-full bg-[var(--c-mint)]/20 px-3 py-0.5 text-center text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--c-mint)]"
              />
              <span className="text-xs font-bold text-[var(--c-black)]/40">%</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(rate.id)}
              className="rounded-full bg-[var(--c-coral)] px-3 py-1 text-xs font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название ставки..."
          className="flex-1 min-w-[160px] rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
        />
        <input
          type="number"
          value={newRate}
          onChange={(e) => setNewRate(e.target.value)}
          placeholder="Ставка %"
          className="w-28 rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim() || !newRate}
          className="rounded-2xl bg-[var(--c-lavender)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}

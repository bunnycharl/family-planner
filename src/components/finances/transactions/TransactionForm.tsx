"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TransactionCategoryData, TransactionData } from "@/lib/finances/types";

interface TransactionFormProps {
  categories: TransactionCategoryData[];
  transaction: TransactionData | null;
  onSave: (data: {
    categoryId: string;
    amount: number;
    date: string;
    description?: string | null;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

function toLocalDateStr(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TransactionForm({
  categories,
  transaction,
  onSave,
  onDelete,
  onClose,
}: TransactionFormProps) {
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? "");
  const [date, setDate] = useState(toLocalDateStr(transaction?.date));
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategoryId(transaction?.categoryId ?? "");
    setAmount(transaction?.amount?.toString() ?? "");
    setDate(toLocalDateStr(transaction?.date));
    setDescription(transaction?.description ?? "");
  }, [transaction]);

  const isValid = categoryId && amount && parseFloat(amount) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await onSave({
        categoryId,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        description: description.trim() || null,
      });
      onClose();
    } catch {
      // toast is handled by parent
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 transition-opacity" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[var(--c-white)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full md:rounded-3xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold uppercase text-[var(--c-black)]">
            {transaction ? "Редактировать" : "Новый расход"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-[var(--c-black)]/40 hover:text-[var(--c-black)] transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40 block mb-1.5">
              Сумма
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-3 text-2xl font-extrabold outline-none focus:border-[var(--c-coral)] transition-colors"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40 block mb-1.5">
              Категория
            </label>
            {categories.length === 0 ? (
              <p className="text-sm font-medium text-[var(--c-black)]/30">
                Сначала создайте категории в Настройках
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
                      categoryId === cat.id
                        ? "text-white"
                        : "border-2 border-[var(--c-black)]/20 text-[var(--c-black)]"
                    )}
                    style={categoryId === cat.id ? { backgroundColor: cat.color } : undefined}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40 block mb-1.5">
              Дата
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40 block mb-1.5">
              Описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание (необязательно)"
              className="w-full rounded-2xl border-2 border-[var(--c-black)]/10 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-[var(--c-lavender)] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!isValid || saving}
              className="flex-1 rounded-full bg-[var(--c-coral)] px-6 py-3 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-40"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
            {transaction && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(transaction.id)}
                className="rounded-full border-2 border-[var(--c-coral)] px-4 py-3 text-sm font-bold text-[var(--c-coral)] hover:opacity-80 transition-opacity cursor-pointer"
              >
                Удалить
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

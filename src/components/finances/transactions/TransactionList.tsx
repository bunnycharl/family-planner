"use client";

import { formatMoney } from "@/lib/finances/calculations";
import type { TransactionData } from "@/lib/finances/types";

interface TransactionListProps {
  transactions: TransactionData[];
  baseCurrency: string;
  onEdit: (transaction: TransactionData) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function TransactionList({
  transactions,
  baseCurrency,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-3xl bg-[var(--c-gray)]">
        <p className="text-sm font-bold uppercase text-[var(--c-black)]/30">
          Нет расходов за этот месяц
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header — desktop only */}
      <div className="hidden md:grid grid-cols-[3fr_2fr_2fr_1fr] px-2 pb-2 border-b border-[var(--c-black)]/10">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Описание
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Категория
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Дата
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40 text-right">
          Сумма
        </span>
      </div>

      {transactions.map((t) => (
        <div
          key={t.id}
          onClick={() => onEdit(t)}
          className="group cursor-pointer border-b border-[var(--c-black)]/5 transition-colors hover:bg-[var(--c-gray)]/60"
        >
          {/* Desktop row */}
          <div className="hidden md:grid grid-cols-[3fr_2fr_2fr_1fr] items-center px-2 py-4">
            <span className="text-base font-semibold tracking-tight text-[var(--c-black)]">
              {t.description || "Без описания"}
            </span>
            <span className="flex items-center gap-2 text-sm text-[var(--c-black)]/60">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: t.category.color }}
              />
              {t.category.name}
            </span>
            <span className="text-sm text-[var(--c-black)]/60">{formatDate(t.date)}</span>
            <div className="flex items-center justify-end gap-2">
              <span className="text-base font-bold text-[var(--c-black)]">
                {formatMoney(t.amount, baseCurrency)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-xs font-bold text-[var(--c-coral)] hover:opacity-60 transition-opacity cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>

          {/* Mobile card */}
          <div className="md:hidden flex items-center justify-between px-2 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--c-black)] truncate">
                {t.description || "Без описания"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: t.category.color }}
                />
                <span className="text-xs text-[var(--c-black)]/50">{t.category.name}</span>
                <span className="text-xs text-[var(--c-black)]/30">{formatDate(t.date)}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-[var(--c-black)] ml-3">
              {formatMoney(t.amount, baseCurrency)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

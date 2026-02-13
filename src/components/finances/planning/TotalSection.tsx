"use client";

import type { MonthSummary } from "@/lib/finances/types";
import { formatMoney } from "@/lib/finances/calculations";
import { cn } from "@/lib/utils";

interface TotalSectionProps {
  summary: MonthSummary;
  currency: string;
}

export function TotalSection({ summary, currency }: TotalSectionProps) {
  return (
    <div className="rounded-3xl bg-[var(--c-black)] p-4 md:p-6 space-y-3 text-white">
      <h3 className="text-xs font-bold uppercase tracking-wide text-white/40">Итого за месяц</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/60">Чистый доход</span>
          <span className="text-sm font-bold">{formatMoney(summary.totalNetIncome, currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/60">Расходы</span>
          <span className="text-sm font-bold text-[var(--c-coral)]">
            −{formatMoney(summary.totalExpenses, currency)}
          </span>
        </div>
        <div className="border-t border-white/20 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold">Остаток</span>
            <span
              className={cn(
                "text-lg font-extrabold",
                summary.balance >= 0 ? "text-[var(--c-mint)]" : "text-[var(--c-coral)]"
              )}
            >
              {formatMoney(summary.balance, currency)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/40">Накоплено с начала года</span>
          <span
            className={cn(
              "text-sm font-bold",
              summary.cumulative >= 0 ? "text-[var(--c-yellow)]" : "text-[var(--c-coral)]"
            )}
          >
            {formatMoney(summary.cumulative, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

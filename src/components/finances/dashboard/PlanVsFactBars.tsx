"use client";

import { usePlanVsFact } from "@/hooks/finances/usePlanVsFact";
import { formatMoney } from "@/lib/finances/calculations";

interface PlanVsFactBarsProps {
  year: number;
  month: number;
  baseCurrency: string;
}

export function PlanVsFactBars({ year, month, baseCurrency }: PlanVsFactBarsProps) {
  const { items, isLoading } = usePlanVsFact(year, month);

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-[var(--c-gray)] p-5 md:p-8 flex items-center justify-center min-h-[120px]">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-[var(--c-gray)] p-5 md:p-8">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[var(--c-black)]">
          План vs Факт
        </h3>
        <p className="mt-2 text-xs font-medium text-[var(--c-black)]/30">
          Настройте связь категорий расходов в Настройках для сравнения плана и факта
        </p>
      </div>
    );
  }

  const totalPlanned = items.reduce((s, i) => s + i.plannedAmount, 0);
  const totalActual = items.reduce((s, i) => s + i.actualAmount, 0);
  const totalPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const totalBarColor =
    totalPct < 80 ? "var(--c-mint)" : totalPct <= 100 ? "var(--c-yellow)" : "var(--c-coral)";

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-5 md:p-8">
      <h3 className="mb-5 text-sm font-extrabold uppercase tracking-wide text-[var(--c-black)]">
        План vs Факт
      </h3>

      {/* Total bar */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-bold text-[var(--c-black)]">Итого: {totalPct}%</span>
          <span className="text-xs font-semibold text-[var(--c-black)]/50">
            {formatMoney(totalActual, baseCurrency)} из {formatMoney(totalPlanned, baseCurrency)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--c-black)]/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(totalPct, 100)}%`,
              backgroundColor: totalBarColor,
            }}
          />
        </div>
      </div>

      {/* Per-category bars */}
      <div className="space-y-3">
        {items.map((item) => {
          const pct = item.percentUsed;
          const barColor =
            pct < 80 ? "var(--c-mint)" : pct <= 100 ? "var(--c-yellow)" : "var(--c-coral)";

          return (
            <div key={item.budgetCategoryId}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[var(--c-black)]/70">
                  {item.budgetCategoryName}
                </span>
                <span className="text-[10px] font-semibold text-[var(--c-black)]/40">
                  {formatMoney(item.actualAmount, baseCurrency)} /{" "}
                  {formatMoney(item.plannedAmount, baseCurrency)} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--c-black)]/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

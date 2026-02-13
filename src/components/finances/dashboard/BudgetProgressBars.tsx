"use client";

import type { MonthSummary } from "@/lib/finances/types";
import { formatMoney, expenseToIncomeRatio } from "@/lib/finances/calculations";

interface BudgetProgressBarsProps {
  summary: MonthSummary | null;
  baseCurrency: string;
}

const GROUP_COLORS = [
  "var(--c-coral)",
  "var(--c-lavender)",
  "var(--c-yellow)",
  "var(--c-mint)",
  "#3b82f6",
  "#f97316",
];

export function BudgetProgressBars({ summary, baseCurrency }: BudgetProgressBarsProps) {
  if (!summary) return null;

  const ratio = expenseToIncomeRatio(summary);

  if (ratio === null) {
    return (
      <div className="rounded-3xl bg-[var(--c-gray)] p-5 md:p-8">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[var(--c-black)]">
          Расходы от дохода
        </h3>
        <p className="mt-2 text-sm font-bold text-[var(--c-black)]/30">Нет данных о доходах</p>
      </div>
    );
  }

  const barColor = ratio < 60 ? "var(--c-mint)" : ratio < 85 ? "var(--c-yellow)" : "var(--c-coral)";

  const expenseGroups = summary.expenseGroupSummaries.filter((g) => g.amountInBaseCurrency > 0);
  const totalExpenses = expenseGroups.reduce((s, g) => s + g.amountInBaseCurrency, 0);

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-5 md:p-8">
      <h3 className="mb-5 text-sm font-extrabold uppercase tracking-wide text-[var(--c-black)]">
        Расходы от дохода
      </h3>

      {/* Main progress bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-bold text-[var(--c-black)]">
            Потрачено {ratio}% от дохода
          </span>
          <span className="text-xs font-semibold text-[var(--c-black)]/50">
            {formatMoney(summary.totalExpenses, baseCurrency)} из{" "}
            {formatMoney(summary.totalNetIncome, baseCurrency)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--c-black)]/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(ratio, 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      </div>

      {/* Per expense group bars */}
      {expenseGroups.length > 0 && totalExpenses > 0 && (
        <div className="space-y-2.5">
          {expenseGroups.map((group, idx) => {
            const groupPct =
              totalExpenses > 0
                ? Math.round((group.amountInBaseCurrency / totalExpenses) * 100)
                : 0;
            return (
              <div key={group.groupId}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-[var(--c-black)]/70">
                    {group.groupName}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--c-black)]/40">
                    {formatMoney(group.amountInBaseCurrency, baseCurrency)} ({groupPct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--c-black)]/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${groupPct}%`,
                      backgroundColor: GROUP_COLORS[idx % GROUP_COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

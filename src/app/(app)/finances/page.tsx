"use client";

import { useState } from "react";
import { useBudgetYear } from "@/hooks/finances/useBudgetYear";
import { computeYearSummary } from "@/lib/finances/calculations";
import { YearSelector } from "@/components/finances/shared/YearSelector";
import { MonthNavigator } from "@/components/finances/shared/MonthNavigator";
import { KPICards } from "@/components/finances/dashboard/KPICards";
import { IncomeExpenseChart } from "@/components/finances/dashboard/IncomeExpenseChart";
import { ExpenseDonutChart } from "@/components/finances/dashboard/ExpenseDonutChart";
import { CumulativeChart } from "@/components/finances/dashboard/CumulativeChart";
import { CompactSummaryTable } from "@/components/finances/dashboard/CompactSummaryTable";

export default function FinanceDashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { data, isLoading } = useBudgetYear(year);

  const summaries = data ? computeYearSummary(data) : null;
  const monthSummary = summaries?.[selectedMonth - 1] ?? null;
  const prevMonthSummary = selectedMonth > 1 ? (summaries?.[selectedMonth - 2] ?? null) : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  if (!data || !summaries) {
    return (
      <div className="space-y-4">
        <YearSelector year={year} onChange={setYear} />
        <div className="flex min-h-[200px] items-center justify-center text-sm font-bold uppercase text-[var(--c-black)]/40">
          Бюджет на {year} год не создан. Перейдите в Настройки.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <YearSelector year={year} onChange={setYear} />
        <MonthNavigator selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      </div>

      <KPICards
        summary={monthSummary}
        prevSummary={prevMonthSummary}
        baseCurrency={data.baseCurrency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart
          summaries={summaries}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
        <ExpenseDonutChart summary={monthSummary} baseCurrency={data.baseCurrency} />
      </div>

      <CumulativeChart summaries={summaries} baseCurrency={data.baseCurrency} />

      <CompactSummaryTable data={data} summaries={summaries} selectedMonth={selectedMonth} />
    </div>
  );
}

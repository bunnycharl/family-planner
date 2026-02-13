"use client";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import { useState } from "react";
import { useBudgetYear } from "@/hooks/finances/useBudgetYear";
import { computeYearSummary } from "@/lib/finances/calculations";
import { YearSelector } from "@/components/finances/shared/YearSelector";
import { MonthNavigator } from "@/components/finances/shared/MonthNavigator";
import { KPICards } from "@/components/finances/dashboard/KPICards";
import { IncomeExpenseChart } from "@/components/finances/dashboard/IncomeExpenseChart";
import { ExpenseDonutChart } from "@/components/finances/dashboard/ExpenseDonutChart";
import { CumulativeChart } from "@/components/finances/dashboard/CumulativeChart";
import { BudgetProgressBars } from "@/components/finances/dashboard/BudgetProgressBars";
import { PlanVsFactBars } from "@/components/finances/dashboard/PlanVsFactBars";
import { CompactSummaryTable } from "@/components/finances/dashboard/CompactSummaryTable";

const MONTH_NAMES_FULL = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

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
    <div className="space-y-8">
      {/* Header: month name + year selector + month pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--c-black)]">
            {MONTH_NAMES_FULL[selectedMonth - 1]}
          </h2>
          <YearSelector year={year} onChange={setYear} />
        </div>
        <MonthNavigator selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KPI — full width */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 animate-fade-in-up">
          <KPICards
            summary={monthSummary}
            prevSummary={prevMonthSummary}
            baseCurrency={data.baseCurrency}
          />
        </div>

        {/* Bar chart — 2/3 */}
        <div
          className="col-span-1 md:col-span-2 lg:col-span-2 animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          <IncomeExpenseChart
            summaries={summaries}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        </div>

        {/* Donut — 1/3 */}
        <div
          className="col-span-1 md:col-span-2 lg:col-span-1 animate-fade-in-up"
          style={{ animationDelay: "160ms" }}
        >
          <ExpenseDonutChart summary={monthSummary} baseCurrency={data.baseCurrency} />
        </div>

        {/* Cumulative — full width */}
        <div
          className="col-span-1 md:col-span-2 lg:col-span-3 animate-fade-in-up"
          style={{ animationDelay: "240ms" }}
        >
          <CumulativeChart
            summaries={summaries}
            baseCurrency={data.baseCurrency}
            selectedMonth={selectedMonth}
          />
        </div>

        {/* Progress bars — 1/3 */}
        <div
          className="col-span-1 md:col-span-1 lg:col-span-1 animate-fade-in-up"
          style={{ animationDelay: "320ms" }}
        >
          <BudgetProgressBars summary={monthSummary} baseCurrency={data.baseCurrency} />
        </div>

        {/* Plan vs Fact — 2/3 */}
        <div
          className="col-span-1 md:col-span-1 lg:col-span-2 animate-fade-in-up"
          style={{ animationDelay: "360ms" }}
        >
          <PlanVsFactBars year={year} month={selectedMonth} baseCurrency={data.baseCurrency} />
        </div>

        {/* Summary table — full width */}
        <div
          className="col-span-1 md:col-span-2 lg:col-span-3 animate-fade-in-up"
          style={{ animationDelay: "440ms" }}
        >
          <CompactSummaryTable data={data} summaries={summaries} selectedMonth={selectedMonth} />
        </div>
      </div>
    </div>
  );
}

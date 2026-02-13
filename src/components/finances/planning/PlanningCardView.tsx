"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BudgetYearData, BulkUpsertInput } from "@/lib/finances/types";
import { computeYearSummary } from "@/lib/finances/calculations";
import { MonthNavigator } from "@/components/finances/shared/MonthNavigator";
import { IncomeSection } from "./IncomeSection";
import { ExpenseSection } from "./ExpenseSection";
import { TotalSection } from "./TotalSection";

interface PlanningCardViewProps {
  data: BudgetYearData;
  onCellChange: (entry: Partial<BulkUpsertInput>) => void;
  onCopyMonth: (fromMonth: number, toMonths: number[]) => Promise<void>;
}

export function PlanningCardView({ data, onCellChange, onCopyMonth }: PlanningCardViewProps) {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);

  const summaries = computeYearSummary(data);
  const monthSummary = summaries[selectedMonth - 1];

  async function handleCopyMonth(toMonth: number) {
    try {
      await onCopyMonth(selectedMonth, [toMonth]);
      toast.success(`Данные скопированы в ${toMonth}-й месяц`);
      setCopyMenuOpen(false);
    } catch {
      toast.error("Ошибка при копировании");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <MonthNavigator selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setCopyMenuOpen(!copyMenuOpen)}
            className="rounded-full bg-[var(--c-gray)] px-3 py-2 text-xs font-bold text-[var(--c-black)]/60 hover:text-[var(--c-black)] transition-colors cursor-pointer"
          >
            Копировать →
          </button>
          {copyMenuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 rounded-2xl bg-white p-2 shadow-lg border border-[var(--c-black)]/10 min-w-[140px]">
              {Array.from({ length: 12 }, (_, i) => i + 1)
                .filter((m) => m !== selectedMonth)
                .map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleCopyMonth(m)}
                    className="w-full rounded-xl px-3 py-1.5 text-left text-sm font-medium hover:bg-[var(--c-gray)] transition-colors cursor-pointer"
                  >
                    → Месяц {m}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Income sections */}
      {data.incomeUsers.map((user) => {
        const userSummary = monthSummary?.userSummaries.find((us) => us.userId === user.id);
        return (
          <IncomeSection
            key={user.id}
            user={user}
            month={selectedMonth}
            summary={userSummary}
            baseCurrency={data.baseCurrency}
            onCellChange={onCellChange}
          />
        );
      })}

      {/* Expense sections */}
      {data.expenseGroups.map((group) => {
        const groupSummary = monthSummary?.expenseGroupSummaries.find(
          (gs) => gs.groupId === group.id
        );
        return (
          <ExpenseSection
            key={group.id}
            group={group}
            month={selectedMonth}
            data={data}
            summary={groupSummary}
            onCellChange={onCellChange}
          />
        );
      })}

      {/* Total section */}
      {monthSummary && <TotalSection summary={monthSummary} currency={data.baseCurrency} />}
    </div>
  );
}

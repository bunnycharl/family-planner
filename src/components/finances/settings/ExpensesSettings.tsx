"use client";

import { ExpenseGroupsSettings } from "./ExpenseGroupsSettings";
import { TransactionCategoriesSettings } from "./TransactionCategoriesSettings";
import type { BudgetYearData } from "@/lib/finances/types";

interface ExpensesSettingsProps {
  year: number;
  data: BudgetYearData;
  mutations: {
    createExpenseGroup: (data: { name: string; currency: string }) => Promise<void>;
    updateExpenseGroup: (id: string, data: { name?: string; currency?: string }) => Promise<void>;
    deleteExpenseGroup: (id: string) => Promise<void>;
    createExpenseCategory: (groupId: string, data: { name: string }) => Promise<void>;
    deleteExpenseCategory: (groupId: string, catId: string) => Promise<void>;
  };
}

export function ExpensesSettings({ year, data, mutations }: ExpensesSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Группы расходов
        </h2>
        <ExpenseGroupsSettings data={data} mutations={mutations} />
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
          Категории расходов
        </h2>
        <TransactionCategoriesSettings year={year} budgetData={data} />
      </div>
    </div>
  );
}

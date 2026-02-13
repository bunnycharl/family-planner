"use client";

import { useState } from "react";
import { YearSelector } from "@/components/finances/YearSelector";
import { FinanceTabs, FinanceTab } from "@/components/finances/FinanceTabs";
import { IncomeSheet } from "@/components/finances/IncomeSheet";
import { IncomeParamSheet } from "@/components/finances/IncomeParamSheet";
import { ExpenseSheet } from "@/components/finances/ExpenseSheet";
import { SummarySheet } from "@/components/finances/SummarySheet";
import { FinanceSettings } from "@/components/finances/FinanceSettings";

export default function FinancesPage() {
  const [year, setYear] = useState(2026);
  const [tab, setTab] = useState<FinanceTab>("nikita");

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="sticky top-0 z-20 -mx-4 -mt-4 bg-white px-4 pt-4 pb-4 md:-mx-8 md:-mt-8 md:px-8 md:pt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
            <span className="bg-[var(--c-coral)] px-4 py-1 rounded-xl inline-block text-white">
              Финансы
            </span>
          </h1>
          {tab !== "settings" && <YearSelector year={year} onChange={setYear} />}
        </div>
        <FinanceTabs active={tab} onChange={setTab} />
      </div>
      {tab === "nikita" && <IncomeSheet year={year} />}
      {tab === "darya" && <IncomeParamSheet year={year} />}
      {tab === "expenses" && <ExpenseSheet year={year} />}
      {tab === "summary" && <SummarySheet year={year} />}
      {tab === "settings" && <FinanceSettings />}
    </div>
  );
}

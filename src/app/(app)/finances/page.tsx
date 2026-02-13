"use client";

import { useState } from "react";
import { YearSelector } from "@/components/finances/YearSelector";
import { FinanceTabs, FinanceTab } from "@/components/finances/FinanceTabs";
import { IncomeSheet } from "@/components/finances/IncomeSheet";
import { IncomeParamSheet } from "@/components/finances/IncomeParamSheet";
import { ExpenseSheet } from "@/components/finances/ExpenseSheet";
import { SummarySheet } from "@/components/finances/SummarySheet";

export default function FinancesPage() {
  const [year, setYear] = useState(2026);
  const [tab, setTab] = useState<FinanceTab>("nikita");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
          Финансы
        </h1>
        <YearSelector year={year} onChange={setYear} />
      </div>
      <FinanceTabs active={tab} onChange={setTab} />
      {tab === "nikita" && <IncomeSheet year={year} />}
      {tab === "darya" && <IncomeParamSheet year={year} />}
      {tab === "expenses" && <ExpenseSheet year={year} />}
      {tab === "summary" && <SummarySheet year={year} />}
    </div>
  );
}

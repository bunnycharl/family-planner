"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBudgetYear } from "@/hooks/finances/useBudgetYear";
import { useBudgetMutations } from "@/hooks/finances/useBudgetMutations";
import { YearSelector } from "@/components/finances/shared/YearSelector";
import { MembersSettings } from "@/components/finances/settings/MembersSettings";
import { IncomeCategoriesSettings } from "@/components/finances/settings/IncomeCategoriesSettings";
import { TaxRatesSettings } from "@/components/finances/settings/TaxRatesSettings";
import { ExpenseGroupsSettings } from "@/components/finances/settings/ExpenseGroupsSettings";

type SettingsSection = "members" | "income" | "tax" | "expenses";

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: "members", label: "Члены семьи" },
  { key: "income", label: "Категории доходов" },
  { key: "tax", label: "Налоговые ставки" },
  { key: "expenses", label: "Группы расходов" },
];

export default function FinanceSettingsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, mutate } = useBudgetYear(year);
  const mutations = useBudgetMutations(year, mutate);
  const [section, setSection] = useState<SettingsSection>("members");

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <YearSelector year={year} onChange={setYear} />
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-3xl bg-[var(--c-gray)] p-8">
          <p className="text-sm font-bold uppercase text-[var(--c-black)]/40">
            Бюджет на {year} год не создан
          </p>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year }),
              });
              mutate();
            }}
            className="rounded-full bg-[var(--c-lavender)] px-6 py-3 text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Создать бюджет на {year}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <YearSelector year={year} onChange={setYear} />

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              section === s.key
                ? "bg-[var(--c-black)] text-white"
                : "border-2 border-[var(--c-black)]/20 bg-[var(--c-white)] text-[var(--c-black)] hover:border-[var(--c-black)]/40"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "members" && <MembersSettings data={data} mutations={mutations} />}
      {section === "income" && <IncomeCategoriesSettings data={data} mutations={mutations} />}
      {section === "tax" && <TaxRatesSettings data={data} mutations={mutations} />}
      {section === "expenses" && <ExpenseGroupsSettings data={data} mutations={mutations} />}
    </div>
  );
}

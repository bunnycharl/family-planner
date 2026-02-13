"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBudgetYear } from "@/hooks/finances/useBudgetYear";
import { useBudgetMutations } from "@/hooks/finances/useBudgetMutations";
import { YearSelector } from "@/components/finances/shared/YearSelector";
import { IncomeCategoriesSettings } from "@/components/finances/settings/IncomeCategoriesSettings";
import { BasicsSettings } from "@/components/finances/settings/BasicsSettings";
import { ExpensesSettings } from "@/components/finances/settings/ExpensesSettings";

type SettingsSection = "income" | "basics" | "expenses";

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: "income", label: "Доходы" },
  { key: "basics", label: "Вводные" },
  { key: "expenses", label: "Расходы" },
];

export default function FinanceSettingsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, mutate } = useBudgetYear(year);
  const mutations = useBudgetMutations(year, mutate);
  const [section, setSection] = useState<SettingsSection>("income");
  const [creating, setCreating] = useState(false);

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
            disabled={creating}
            onClick={async () => {
              setCreating(true);
              try {
                const res = await fetch("/api/budget", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ year }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  throw new Error(err.error || "Не удалось создать бюджет");
                }
                await mutate();
                toast.success(`Бюджет на ${year} создан`);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Ошибка создания бюджета");
              } finally {
                setCreating(false);
              }
            }}
            className={cn(
              "rounded-full bg-[var(--c-lavender)] px-6 py-3 text-sm font-bold text-white transition-opacity cursor-pointer",
              creating ? "opacity-50 cursor-wait" : "hover:opacity-80"
            )}
          >
            {creating ? "Создаём..." : `Создать бюджет на ${year}`}
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

      {section === "income" && <IncomeCategoriesSettings data={data} mutations={mutations} />}
      {section === "basics" && <BasicsSettings year={year} data={data} mutations={mutations} />}
      {section === "expenses" && <ExpensesSettings year={year} data={data} mutations={mutations} />}
    </div>
  );
}

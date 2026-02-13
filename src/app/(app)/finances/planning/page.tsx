"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBudgetYear } from "@/hooks/finances/useBudgetYear";
import { useBudgetMutations } from "@/hooks/finances/useBudgetMutations";
import { useAutoSave } from "@/hooks/finances/useAutoSave";
import { YearSelector } from "@/components/finances/shared/YearSelector";
import { SaveIndicator } from "@/components/finances/shared/SaveIndicator";
import { PlanningCardView } from "@/components/finances/planning/PlanningCardView";
import { PlanningTableView } from "@/components/finances/planning/PlanningTableView";

export default function PlanningPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const { data, isLoading, mutate } = useBudgetYear(year);
  const { saveEntries, copyMonth } = useBudgetMutations(year, mutate);
  const { queueSave, status } = useAutoSave(saveEntries);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm font-bold uppercase text-[var(--c-black)]/40">
        Бюджет на {year} год не создан. Перейдите в Настройки.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <YearSelector year={year} onChange={setYear} />
        <div className="flex items-center gap-3">
          <SaveIndicator status={status} />
          <div className="flex rounded-full bg-[var(--c-gray)] p-1">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "card"
                  ? "bg-[var(--c-lavender)] text-white"
                  : "text-[var(--c-black)]/60 hover:text-[var(--c-black)]"
              )}
            >
              Карточки
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-[var(--c-lavender)] text-white"
                  : "text-[var(--c-black)]/60 hover:text-[var(--c-black)]"
              )}
            >
              Таблица
            </button>
          </div>
        </div>
      </div>

      {viewMode === "card" ? (
        <PlanningCardView data={data} onCellChange={queueSave} onCopyMonth={copyMonth} />
      ) : (
        <PlanningTableView data={data} onCellChange={queueSave} />
      )}
    </div>
  );
}

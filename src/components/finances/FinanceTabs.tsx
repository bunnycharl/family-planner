"use client";

import { cn } from "@/lib/utils";

export type FinanceTab = "nikita" | "darya" | "expenses" | "summary" | "settings";

const TABS: { key: FinanceTab; label: string; color: string }[] = [
  { key: "nikita", label: "Никита", color: "var(--c-lavender)" },
  { key: "darya", label: "Дарья", color: "var(--c-coral)" },
  { key: "expenses", label: "Расходы", color: "var(--c-yellow)" },
  { key: "summary", label: "Итого", color: "var(--c-mint)" },
  { key: "settings", label: "Настройки", color: "var(--c-black)" },
];

interface FinanceTabsProps {
  active: FinanceTab;
  onChange: (tab: FinanceTab) => void;
}

export function FinanceTabs({ active, onChange }: FinanceTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-bold uppercase transition-all cursor-pointer",
              isActive
                ? "text-white"
                : "border-2 border-[var(--c-black)] bg-white text-[var(--c-black)] hover:opacity-80"
            )}
            style={isActive ? { backgroundColor: tab.color } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

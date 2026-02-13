"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFinanceExpenses } from "@/hooks/useFinanceExpenses";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { EXPENSE_CATEGORIES_MOSCOW, EXPENSE_CATEGORIES_ONETIME } from "@/lib/finance-utils";
import { SpreadsheetGrid, GridRow } from "./SpreadsheetGrid";

const EXPENSE_CATEGORIES_SPAIN = ["Аренда", "Продукты", "Транспорт", "Связь", "Прочее"] as const;

type ExpenseSubTab = "moscow" | "spain" | "onetime";

const SUB_TABS: { key: ExpenseSubTab; label: string }[] = [
  { key: "moscow", label: "Москва" },
  { key: "spain", label: "Испания" },
  { key: "onetime", label: "Разовые" },
];

interface ExpenseSheetProps {
  year: number;
}

export function ExpenseSheet({ year }: ExpenseSheetProps) {
  const [subTab, setSubTab] = useState<ExpenseSubTab>("moscow");

  const {
    entries,
    isLoading: expensesLoading,
    mutate: mutateExpenses,
  } = useFinanceExpenses({ year });

  const { rates, isLoading: ratesLoading, mutate: mutateRates } = useExchangeRates({ year });

  if (expensesLoading || ratesLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  // Build expense lookup: group -> category -> month (0-based) -> amount
  const expenseLookup: Record<string, Record<string, number[]>> = {};
  for (const entry of entries) {
    const group = entry.group as string;
    const cat = entry.category as string;
    const monthIdx = (entry.month as number) - 1;
    if (!expenseLookup[group]) expenseLookup[group] = {};
    if (!expenseLookup[group][cat]) expenseLookup[group][cat] = Array(12).fill(0);
    expenseLookup[group][cat][monthIdx] = entry.amount as number;
  }

  // Build exchange rate lookup: month (0-based) -> eurRub
  const rateLookup = Array(12).fill(0) as number[];
  for (const r of rates) {
    const monthIdx = (r.month as number) - 1;
    rateLookup[monthIdx] = r.eurRub as number;
  }

  function getValues(group: string, category: string): number[] {
    return expenseLookup[group]?.[category] ?? Array(12).fill(0);
  }

  async function handleExpenseChange(
    group: string,
    categories: readonly string[],
    rowIndex: number,
    monthIndex: number,
    value: number
  ) {
    if (rowIndex >= categories.length) return;

    const month = monthIndex + 1;
    const monthEntries = categories.map((cat, i) => ({
      category: cat,
      amount: i === rowIndex ? value : getValues(group, cat)[monthIndex],
    }));

    await fetch("/api/finances/expenses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, group, entries: monthEntries }),
    });

    mutateExpenses();
  }

  async function handleRateChange(_rowIndex: number, monthIndex: number, value: number) {
    const month = monthIndex + 1;
    await fetch("/api/finances/exchange-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, eurRub: value }),
    });

    mutateRates();
  }

  function renderMoscow() {
    const categories = EXPENSE_CATEGORIES_MOSCOW;
    const totalRow = Array(12).fill(0) as number[];
    for (let m = 0; m < 12; m++) {
      for (const cat of categories) {
        totalRow[m] += getValues("moscow", cat)[m];
      }
    }

    const rows: GridRow[] = [
      ...categories.map((cat) => ({
        label: cat,
        values: getValues("moscow", cat),
        suffix: " \u20BD",
      })),
      {
        label: "Итого Москва",
        values: totalRow,
        bold: true,
        readOnly: true,
        suffix: " \u20BD",
      },
    ];

    return (
      <SpreadsheetGrid
        rows={rows}
        onCellChange={(rowIdx, monthIdx, val) =>
          handleExpenseChange("moscow", categories, rowIdx, monthIdx, val)
        }
      />
    );
  }

  function renderSpain() {
    const categories = EXPENSE_CATEGORIES_SPAIN;
    const totalEur = Array(12).fill(0) as number[];
    const totalRub = Array(12).fill(0) as number[];

    for (let m = 0; m < 12; m++) {
      for (const cat of categories) {
        totalEur[m] += getValues("spain", cat)[m];
      }
      totalRub[m] = Math.round(totalEur[m] * rateLookup[m]);
    }

    const rateRow: GridRow[] = [
      {
        label: "Курс EUR/RUB",
        values: [...rateLookup],
      },
    ];

    const rows: GridRow[] = [
      ...categories.map((cat) => ({
        label: cat,
        values: getValues("spain", cat),
        suffix: " \u20AC",
      })),
      {
        label: "Итого Испания",
        values: totalEur,
        bold: true,
        readOnly: true,
        suffix: " \u20AC",
      },
      {
        label: "Итого в \u20BD",
        values: totalRub,
        bold: true,
        readOnly: true,
        suffix: " \u20BD",
      },
    ];

    return (
      <div className="space-y-4">
        <SpreadsheetGrid rows={rateRow} onCellChange={handleRateChange} showTotal={false} />
        <SpreadsheetGrid
          rows={rows}
          onCellChange={(rowIdx, monthIdx, val) =>
            handleExpenseChange("spain", categories, rowIdx, monthIdx, val)
          }
        />
      </div>
    );
  }

  function renderOnetime() {
    const categories = EXPENSE_CATEGORIES_ONETIME;
    const totalRow = Array(12).fill(0) as number[];
    for (let m = 0; m < 12; m++) {
      for (const cat of categories) {
        totalRow[m] += getValues("onetime", cat)[m];
      }
    }

    const rows: GridRow[] = [
      ...categories.map((cat) => ({
        label: cat,
        values: getValues("onetime", cat),
        suffix: " \u20BD",
      })),
      {
        label: "Итого разовые",
        values: totalRow,
        bold: true,
        readOnly: true,
        suffix: " \u20BD",
      },
    ];

    return (
      <SpreadsheetGrid
        rows={rows}
        onCellChange={(rowIdx, monthIdx, val) =>
          handleExpenseChange("onetime", categories, rowIdx, monthIdx, val)
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSubTab(tab.key)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              subTab === tab.key
                ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                : "border-2 border-[var(--c-black)]/20 bg-white text-[var(--c-black)] hover:border-[var(--c-black)]/40"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "moscow" && renderMoscow()}
      {subTab === "spain" && renderSpain()}
      {subTab === "onetime" && renderOnetime()}
    </div>
  );
}

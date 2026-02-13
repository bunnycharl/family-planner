"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFinanceExpenses } from "@/hooks/useFinanceExpenses";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useExpenseGroups } from "@/hooks/useExpenseGroups";
import { SpreadsheetGrid, GridRow } from "./SpreadsheetGrid";

interface ExpenseSheetProps {
  year: number;
}

interface ExpenseGroupData {
  id: string;
  name: string;
  slug: string;
  currency: string;
  position: number;
  categories: { id: string; name: string; position: number }[];
}

export function ExpenseSheet({ year }: ExpenseSheetProps) {
  const [activeGroupSlug, setActiveGroupSlug] = useState<string>("");

  const { groups, isLoading: groupsLoading } = useExpenseGroups();
  const {
    entries,
    isLoading: expensesLoading,
    mutate: mutateExpenses,
  } = useFinanceExpenses({ year });
  const { rates, isLoading: ratesLoading, mutate: mutateRates } = useExchangeRates({ year });

  const isLoading = groupsLoading || expensesLoading || ratesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  const typedGroups: ExpenseGroupData[] = groups;

  // Default to first group if not set
  const currentSlug = activeGroupSlug || typedGroups[0]?.slug || "";
  const currentGroup = typedGroups.find((g) => g.slug === currentSlug);

  if (!currentGroup || typedGroups.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm font-bold uppercase text-[#999]">
        Нет групп расходов
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
    categoryNames: string[],
    rowIndex: number,
    monthIndex: number,
    value: number
  ) {
    if (rowIndex >= categoryNames.length) return;

    const month = monthIndex + 1;
    const monthEntries = categoryNames.map((cat, i) => ({
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

  function renderGroup(group: ExpenseGroupData) {
    const categoryNames = group.categories.map((c) => c.name);
    const isNonRub = group.currency !== "RUB";
    const currencySymbol = isNonRub ? " \u20AC" : " \u20BD";

    const totalRow = Array(12).fill(0) as number[];
    for (let m = 0; m < 12; m++) {
      for (const cat of categoryNames) {
        totalRow[m] += getValues(group.slug, cat)[m];
      }
    }

    const rows: GridRow[] = [
      ...categoryNames.map((cat) => ({
        label: cat,
        values: getValues(group.slug, cat),
        suffix: currencySymbol,
      })),
      {
        label: `Итого ${group.name}`,
        values: totalRow,
        bold: true,
        readOnly: true,
        suffix: currencySymbol,
      },
    ];

    // For non-RUB groups, add conversion row
    if (isNonRub) {
      const totalRub = Array(12).fill(0) as number[];
      for (let m = 0; m < 12; m++) {
        totalRub[m] = Math.round(totalRow[m] * rateLookup[m]);
      }
      rows.push({
        label: "Итого в \u20BD",
        values: totalRub,
        bold: true,
        readOnly: true,
        suffix: " \u20BD",
      });
    }

    if (isNonRub) {
      const rateRow: GridRow[] = [
        {
          label: `Курс ${group.currency}/RUB`,
          values: [...rateLookup],
        },
      ];

      return (
        <div className="space-y-4">
          <SpreadsheetGrid rows={rateRow} onCellChange={handleRateChange} showTotal={false} />
          <SpreadsheetGrid
            rows={rows}
            onCellChange={(rowIdx, monthIdx, val) =>
              handleExpenseChange(group.slug, categoryNames, rowIdx, monthIdx, val)
            }
          />
        </div>
      );
    }

    return (
      <SpreadsheetGrid
        rows={rows}
        onCellChange={(rowIdx, monthIdx, val) =>
          handleExpenseChange(group.slug, categoryNames, rowIdx, monthIdx, val)
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {typedGroups.map((group) => (
          <button
            key={group.slug}
            type="button"
            onClick={() => setActiveGroupSlug(group.slug)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              currentSlug === group.slug
                ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                : "border-2 border-[var(--c-black)]/20 bg-white text-[var(--c-black)] hover:border-[var(--c-black)]/40"
            )}
          >
            {group.name}
          </button>
        ))}
      </div>

      {renderGroup(currentGroup)}
    </div>
  );
}

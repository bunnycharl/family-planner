"use client";

import { useFinancePersons } from "@/hooks/useFinancePersons";
import { useFinanceIncome } from "@/hooks/useFinanceIncome";
import { INCOME_CATEGORIES_NIKITA, computeTax } from "@/lib/finance-utils";
import { SpreadsheetGrid, GridRow } from "./SpreadsheetGrid";

interface IncomeSheetProps {
  year: number;
}

export function IncomeSheet({ year }: IncomeSheetProps) {
  const { persons, isLoading: personsLoading } = useFinancePersons();
  const nikita = persons.find((p: { slug: string }) => p.slug === "nikita");
  const personId = nikita?.id ?? "";

  const { entries, isLoading: entriesLoading, mutate } = useFinanceIncome({ year, personId });

  if (personsLoading || entriesLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  // Build a lookup: category -> month (0-based) -> amount
  const lookup: Record<string, number[]> = {};
  for (const cat of INCOME_CATEGORIES_NIKITA) {
    lookup[cat] = Array(12).fill(0);
  }
  for (const entry of entries) {
    const cat = entry.category as string;
    const monthIdx = (entry.month as number) - 1;
    if (lookup[cat]) {
      lookup[cat][monthIdx] = entry.amount as number;
    }
  }

  // Compute totals per month
  const totalIncome = Array(12).fill(0) as number[];
  const totalTax = Array(12).fill(0) as number[];
  const netIncome = Array(12).fill(0) as number[];

  for (let m = 0; m < 12; m++) {
    let income = 0;
    let tax = 0;
    for (const cat of INCOME_CATEGORIES_NIKITA) {
      const amount = lookup[cat][m];
      income += amount;
      tax += computeTax("nikita", cat, amount);
    }
    totalIncome[m] = income;
    totalTax[m] = tax;
    netIncome[m] = income - tax;
  }

  const rows: GridRow[] = [
    ...INCOME_CATEGORIES_NIKITA.map((cat) => ({
      label: cat,
      values: lookup[cat],
      suffix: " \u20BD",
    })),
    {
      label: "Итого доход",
      values: totalIncome,
      bold: true,
      readOnly: true,
      suffix: " \u20BD",
    },
    {
      label: "Налог (13% инвестиции)",
      values: totalTax,
      readOnly: true,
      negative: true,
      suffix: " \u20BD",
    },
    {
      label: "Чистый доход",
      values: netIncome,
      bold: true,
      readOnly: true,
      suffix: " \u20BD",
    },
  ];

  async function handleCellChange(rowIndex: number, monthIndex: number, value: number) {
    // Only editable rows are category rows (indices 0..N-1)
    if (rowIndex >= INCOME_CATEGORIES_NIKITA.length) return;

    const month = monthIndex + 1;
    // Build entries for this month: update the changed category, keep others
    const monthEntries = INCOME_CATEGORIES_NIKITA.map((cat, i) => ({
      category: cat,
      amount: i === rowIndex ? value : lookup[cat][monthIndex],
    }));

    await fetch("/api/finances/income", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        year,
        month,
        entries: monthEntries,
      }),
    });

    mutate();
  }

  return <SpreadsheetGrid rows={rows} onCellChange={handleCellChange} />;
}

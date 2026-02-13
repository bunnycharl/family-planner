"use client";

import { useFinancePersons } from "@/hooks/useFinancePersons";
import { useFinanceIncome } from "@/hooks/useFinanceIncome";
import { useFinanceIncomeCategories } from "@/hooks/useFinanceIncomeCategories";
import { useFinanceTaxRules } from "@/hooks/useFinanceTaxRules";
import { computeTaxDynamic } from "@/lib/finance-utils";
import { SpreadsheetGrid, GridRow } from "./SpreadsheetGrid";

interface IncomeSheetProps {
  year: number;
}

export function IncomeSheet({ year }: IncomeSheetProps) {
  const { persons, isLoading: personsLoading } = useFinancePersons();
  const nikita = persons.find((p: { slug: string }) => p.slug === "nikita");
  const personId = nikita?.id ?? "";

  const { entries, isLoading: entriesLoading, mutate } = useFinanceIncome({ year, personId });
  const { categories: allCategories, isLoading: catsLoading } = useFinanceIncomeCategories();
  const { rules: allRules, isLoading: rulesLoading } = useFinanceTaxRules();

  if (personsLoading || entriesLoading || catsLoading || rulesLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  // Dynamic categories for nikita from DB
  const categories: string[] = allCategories
    .filter((c: { personId: string }) => c.personId === personId)
    .map((c: { name: string }) => c.name);

  // Dynamic tax rules for nikita from DB
  const taxRules: { category: string; rate: number }[] = allRules
    .filter((r: { personId: string }) => r.personId === personId)
    .map((r: { category: string; rate: number }) => ({ category: r.category, rate: r.rate }));

  // Build a lookup: category -> month (0-based) -> amount
  const lookup: Record<string, number[]> = {};
  for (const cat of categories) {
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
    for (const cat of categories) {
      const amount = lookup[cat]?.[m] ?? 0;
      income += amount;
      tax += computeTaxDynamic(taxRules, cat, amount);
    }
    totalIncome[m] = income;
    totalTax[m] = tax;
    netIncome[m] = income - tax;
  }

  // Build tax label from dynamic rules
  const taxLabel =
    taxRules.length > 0
      ? `Налог (${taxRules.map((r) => `${Math.round(r.rate * 100)}% ${r.category.toLowerCase()}`).join(", ")})`
      : "Налог";

  const rows: GridRow[] = [
    ...categories.map((cat) => ({
      label: cat,
      values: lookup[cat] ?? Array(12).fill(0),
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
      label: taxLabel,
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
    if (rowIndex >= categories.length) return;

    const month = monthIndex + 1;
    const monthEntries = categories.map((cat, i) => ({
      category: cat,
      amount: i === rowIndex ? value : (lookup[cat]?.[monthIndex] ?? 0),
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

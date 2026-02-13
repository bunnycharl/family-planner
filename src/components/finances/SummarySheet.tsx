"use client";

import { useFinanceSummary } from "@/hooks/useFinanceSummary";
import { SpreadsheetGrid, GridRow } from "./SpreadsheetGrid";

interface SummarySheetProps {
  year: number;
}

interface PersonMonth {
  personId: string;
  personName: string;
  personSlug: string;
  grossIncome: number;
  tax: number;
  netIncome: number;
  categories: Record<string, number>;
}

interface MonthSummary {
  month: number;
  label: string;
  persons: PersonMonth[];
  totalIncome: number;
  totalTax: number;
  totalNetIncome: number;
  expenses: {
    moscow: number;
    spain: number;
    spainRub: number;
    onetime: number;
    total: number;
  };
  eurRub: number;
  netAfterExpenses: number;
  cumulative: number;
}

export function SummarySheet({ year }: SummarySheetProps) {
  const { summary, isLoading } = useFinanceSummary({ year });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  if (!summary || !summary.months) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm font-bold uppercase text-[#999]">
        Нет данных
      </div>
    );
  }

  const months: MonthSummary[] = summary.months;
  const personsList: { personId: string; personName: string; personSlug: string }[] =
    summary.persons ?? [];

  // Helper: extract an array of 12 values from months using an accessor
  function monthValues(accessor: (m: MonthSummary) => number): number[] {
    const vals = Array(12).fill(0) as number[];
    for (const m of months) {
      vals[m.month - 1] = accessor(m);
    }
    return vals;
  }

  function personMonthValues(personId: string, accessor: (pm: PersonMonth) => number): number[] {
    const vals = Array(12).fill(0) as number[];
    for (const m of months) {
      const pm = m.persons.find((p) => p.personId === personId);
      if (pm) vals[m.month - 1] = accessor(pm);
    }
    return vals;
  }

  const rows: GridRow[] = [];

  // Per-person rows
  for (const person of personsList) {
    rows.push({
      label: `Доход ${person.personName}`,
      values: personMonthValues(person.personId, (pm) => pm.grossIncome),
      readOnly: true,
      suffix: " \u20BD",
    });
    rows.push({
      label: `Налог ${person.personName}`,
      values: personMonthValues(person.personId, (pm) => pm.tax),
      readOnly: true,
      negative: true,
      suffix: " \u20BD",
    });
    rows.push({
      label: `Чистый доход ${person.personName}`,
      values: personMonthValues(person.personId, (pm) => pm.netIncome),
      readOnly: true,
      suffix: " \u20BD",
    });
  }

  // Total income rows
  rows.push({
    label: "ИТОГО ДОХОД",
    values: monthValues((m) => m.totalIncome),
    bold: true,
    readOnly: true,
    suffix: " \u20BD",
  });
  rows.push({
    label: "ИТОГО НАЛОГ",
    values: monthValues((m) => m.totalTax),
    bold: true,
    readOnly: true,
    negative: true,
    suffix: " \u20BD",
  });
  rows.push({
    label: "ЧИСТЫЙ ДОХОД",
    values: monthValues((m) => m.totalNetIncome),
    bold: true,
    readOnly: true,
    suffix: " \u20BD",
  });

  // Expense rows
  rows.push({
    label: "Расходы Москва",
    values: monthValues((m) => m.expenses.moscow),
    readOnly: true,
    suffix: " \u20BD",
  });
  rows.push({
    label: "Расходы Испания (\u20BD)",
    values: monthValues((m) => m.expenses.spainRub),
    readOnly: true,
    suffix: " \u20BD",
  });
  rows.push({
    label: "Расходы разовые",
    values: monthValues((m) => m.expenses.onetime),
    readOnly: true,
    suffix: " \u20BD",
  });
  rows.push({
    label: "ИТОГО РАСХОДЫ",
    values: monthValues((m) => m.expenses.total),
    bold: true,
    readOnly: true,
    negative: true,
    suffix: " \u20BD",
  });

  // Net and cumulative
  rows.push({
    label: "ОСТАТОК",
    values: monthValues((m) => m.netAfterExpenses),
    bold: true,
    readOnly: true,
    highlight: true,
    suffix: " \u20BD",
  });
  rows.push({
    label: "НАКОПИТЕЛЬНО",
    values: monthValues((m) => m.cumulative),
    bold: true,
    readOnly: true,
    highlight: true,
    suffix: " \u20BD",
  });

  return <SpreadsheetGrid rows={rows} />;
}

"use client";

import { useFinancePersons } from "@/hooks/useFinancePersons";
import { useFinanceIncomeParams } from "@/hooks/useFinanceIncomeParams";
import { useFinanceIncome } from "@/hooks/useFinanceIncome";
import {
  DARYA_PARAM_KEYS,
  INCOME_CATEGORIES_DARYA,
  computeDaryaIncome,
  computeTax,
} from "@/lib/finance-utils";
import { SpreadsheetGrid, GridRow } from "./SpreadsheetGrid";

interface IncomeParamSheetProps {
  year: number;
}

export function IncomeParamSheet({ year }: IncomeParamSheetProps) {
  const { persons, isLoading: personsLoading } = useFinancePersons();
  const darya = persons.find((p: { slug: string }) => p.slug === "darya");
  const personId = darya?.id ?? "";

  const {
    params,
    isLoading: paramsLoading,
    mutate: mutateParams,
  } = useFinanceIncomeParams({ year, personId });

  const {
    entries,
    isLoading: incomeLoading,
    mutate: mutateIncome,
  } = useFinanceIncome({ year, personId });

  if (personsLoading || paramsLoading || incomeLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  // Build param lookup: key -> month (0-based) -> value
  const paramLookup: Record<string, number[]> = {};
  for (const pk of DARYA_PARAM_KEYS) {
    paramLookup[pk.key] = Array(12).fill(0);
  }
  for (const p of params) {
    const key = p.key as string;
    const monthIdx = (p.month as number) - 1;
    if (paramLookup[key] !== undefined) {
      paramLookup[key][monthIdx] = p.value as number;
    }
  }

  // Build income lookup from entries
  const incomeLookup: Record<string, number[]> = {};
  for (const cat of INCOME_CATEGORIES_DARYA) {
    incomeLookup[cat] = Array(12).fill(0);
  }
  for (const entry of entries) {
    const cat = entry.category as string;
    const monthIdx = (entry.month as number) - 1;
    if (incomeLookup[cat]) {
      incomeLookup[cat][monthIdx] = entry.amount as number;
    }
  }

  // Compute income from params for each month
  const computedIncome: Record<string, number[]> = {
    "\u041A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u0438": Array(12).fill(0),
    "\u0428\u043A\u043E\u043B\u0430": Array(12).fill(0),
  };
  const totalIncome = Array(12).fill(0) as number[];
  const totalTax = Array(12).fill(0) as number[];
  const netIncome = Array(12).fill(0) as number[];

  for (let m = 0; m < 12; m++) {
    const monthParams: Record<string, number> = {};
    for (const pk of DARYA_PARAM_KEYS) {
      monthParams[pk.key] = paramLookup[pk.key][m];
    }
    const { consultationIncome, schoolIncome } = computeDaryaIncome(monthParams);

    computedIncome["\u041A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u0438"][m] =
      Math.round(consultationIncome);
    computedIncome["\u0428\u043A\u043E\u043B\u0430"][m] = Math.round(schoolIncome);

    const income = Math.round(consultationIncome) + Math.round(schoolIncome);
    totalIncome[m] = income;

    let tax = 0;
    for (const cat of INCOME_CATEGORIES_DARYA) {
      tax += computeTax("darya", cat, computedIncome[cat][m]);
    }
    totalTax[m] = tax;
    netIncome[m] = income - tax;
  }

  // Param rows
  const paramRows: GridRow[] = DARYA_PARAM_KEYS.map((pk) => ({
    label: pk.label,
    values: paramLookup[pk.key],
  }));

  // Income rows
  const incomeRows: GridRow[] = [
    ...INCOME_CATEGORIES_DARYA.map((cat) => ({
      label: cat,
      values: computedIncome[cat],
      readOnly: true,
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
      label: "Налог",
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

  async function handleParamChange(rowIndex: number, monthIndex: number, value: number) {
    if (rowIndex >= DARYA_PARAM_KEYS.length) return;

    const month = monthIndex + 1;
    const monthParams = DARYA_PARAM_KEYS.map((pk, i) => ({
      key: pk.key,
      value: i === rowIndex ? value : paramLookup[pk.key][monthIndex],
    }));

    await fetch("/api/finances/income-params", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        year,
        month,
        params: monthParams,
      }),
    });

    mutateParams();
    mutateIncome();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#999]">Параметры</h3>
        <SpreadsheetGrid rows={paramRows} onCellChange={handleParamChange} />
      </div>
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#999]">Доходы</h3>
        <SpreadsheetGrid rows={incomeRows} />
      </div>
    </div>
  );
}

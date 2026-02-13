"use client";

import { TaxRatesSettings } from "./TaxRatesSettings";
import { CurrencyRatesSettings } from "./CurrencyRatesSettings";
import type { BudgetYearData } from "@/lib/finances/types";

interface BasicsSettingsProps {
  year: number;
  data: BudgetYearData;
  mutations: {
    createTaxRate: (data: { name: string; rate: number }) => Promise<void>;
    updateTaxRate: (id: string, data: { name?: string; rate?: number }) => Promise<void>;
    deleteTaxRate: (id: string) => Promise<void>;
  };
}

export function BasicsSettings({ year, data, mutations }: BasicsSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TaxRatesSettings data={data} mutations={mutations} />
      <CurrencyRatesSettings year={year} />
    </div>
  );
}

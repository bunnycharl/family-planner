"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useCurrencyRates } from "@/hooks/finances/useCurrencyRates";

const CURRENCIES = ["EUR", "USD"] as const;
const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

interface CurrencyRatesSettingsProps {
  year: number;
}

export function CurrencyRatesSettings({ year }: CurrencyRatesSettingsProps) {
  const { rates, isLoading, mutate } = useCurrencyRates(year);
  const [saving, setSaving] = useState(false);

  const getRate = useCallback(
    (currency: string, month: number) => {
      const found = rates.find((r) => r.currency === currency && r.month === month);
      return found?.rate ?? 0;
    },
    [rates]
  );

  async function handleSave(currency: string, month: number, value: string) {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate < 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/budget/${year}/currency-rates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ currency, month, rate }]),
      });
      if (!res.ok) throw new Error();
      await mutate();
    } catch {
      toast.error("Ошибка сохранения курса");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[100px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        Курсы валют к RUB
      </h3>

      <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr>
              <th className="py-2 pr-3 text-left text-xs font-bold uppercase text-[var(--c-black)]/40">
                Валюта
              </th>
              {MONTHS.map((m, i) => (
                <th
                  key={i}
                  className="px-1 py-2 text-center text-xs font-bold uppercase text-[var(--c-black)]/40"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map((currency) => (
              <tr key={currency}>
                <td className="py-1.5 pr-3 text-sm font-extrabold">{currency}</td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <td key={month} className="px-1 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={getRate(currency, month) || ""}
                      key={`${currency}-${month}-${getRate(currency, month)}`}
                      onBlur={(e) => handleSave(currency, month, e.target.value)}
                      disabled={saving}
                      placeholder="0"
                      className="w-full min-w-[56px] rounded-xl bg-white px-2 py-1.5 text-center text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--c-lavender)] transition-shadow disabled:opacity-50"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

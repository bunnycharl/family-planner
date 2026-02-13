"use client";

import type {
  BudgetYearData,
  ExpenseGroupData,
  ExpenseGroupMonthSummary,
  BulkUpsertInput,
} from "@/lib/finances/types";
import { formatMoney, getCurrencyRate } from "@/lib/finances/calculations";
import { Accordion } from "@/components/finances/shared/Accordion";
import { CurrencyInput } from "@/components/finances/shared/CurrencyInput";

interface ExpenseSectionProps {
  group: ExpenseGroupData;
  month: number;
  data: BudgetYearData;
  summary?: ExpenseGroupMonthSummary;
  onCellChange: (entry: Partial<BulkUpsertInput>) => void;
}

export function ExpenseSection({ group, month, data, summary, onCellChange }: ExpenseSectionProps) {
  const isNonBase = group.currency !== data.baseCurrency;
  const rate = getCurrencyRate(data, group.currency, month);

  const subtitle = isNonBase
    ? formatMoney(summary?.amountInBaseCurrency ?? 0, data.baseCurrency)
    : formatMoney(summary?.amount ?? 0, data.baseCurrency);

  return (
    <Accordion
      title={`${group.name} (${group.currency})`}
      subtitle={subtitle}
      color="var(--c-coral)"
    >
      {/* Currency rate for non-base groups */}
      {isNonBase && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--c-yellow)]/10 px-3 py-2">
          <span className="text-xs font-bold text-[var(--c-black)]/50">
            Курс {group.currency}/{data.baseCurrency}
          </span>
          <div className="w-28">
            <CurrencyInput
              value={rate}
              currency=""
              placeholder="0"
              onChange={(newRate) =>
                onCellChange({
                  currencyRates: [{ currency: group.currency, month, rate: newRate }],
                })
              }
            />
          </div>
        </div>
      )}

      {group.categories.map((cat) => {
        const entry = cat.entries.find((e) => e.month === month);
        return (
          <div key={cat.id} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[var(--c-black)]/80 shrink-0">
              {cat.name}
            </span>
            <div className="w-36">
              <CurrencyInput
                value={entry?.amount ?? 0}
                currency={group.currency}
                onChange={(amount) =>
                  onCellChange({
                    expenseEntries: [{ expenseCategoryId: cat.id, month, amount }],
                  })
                }
              />
            </div>
          </div>
        );
      })}

      {/* Group total */}
      {summary && (
        <div className="flex items-center justify-between border-t border-[var(--c-black)]/10 pt-2">
          <span className="text-xs font-bold text-[var(--c-black)]/40">Итого {group.name}</span>
          <span className="text-sm font-extrabold">
            {formatMoney(summary.amount, group.currency)}
            {isNonBase && (
              <span className="ml-2 text-xs font-bold text-[var(--c-black)]/40">
                = {formatMoney(summary.amountInBaseCurrency, data.baseCurrency)}
              </span>
            )}
          </span>
        </div>
      )}
    </Accordion>
  );
}

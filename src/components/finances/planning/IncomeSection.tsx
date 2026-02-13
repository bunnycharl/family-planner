"use client";

import type { FamilyMemberData, MemberMonthSummary, BulkUpsertInput } from "@/lib/finances/types";
import { formatMoney } from "@/lib/finances/calculations";
import { Accordion } from "@/components/finances/shared/Accordion";
import { CurrencyInput } from "@/components/finances/shared/CurrencyInput";

interface IncomeSectionProps {
  member: FamilyMemberData;
  month: number;
  summary?: MemberMonthSummary;
  baseCurrency: string;
  onCellChange: (entry: Partial<BulkUpsertInput>) => void;
}

export function IncomeSection({
  member,
  month,
  summary,
  baseCurrency,
  onCellChange,
}: IncomeSectionProps) {
  return (
    <Accordion
      title={member.name}
      subtitle={summary ? formatMoney(summary.netIncome, baseCurrency) : undefined}
      color="var(--c-lavender)"
    >
      {member.incomeCategories.map((cat) => {
        const catSummary = summary?.categories.find((c) => c.id === cat.id);

        if (cat.type === "FIXED") {
          const entry = cat.entries.find((e) => e.month === month);
          return (
            <div key={cat.id} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--c-black)]/80 shrink-0">
                {cat.name}
              </span>
              <div className="w-36">
                <CurrencyInput
                  value={entry?.amount ?? 0}
                  currency={baseCurrency}
                  onChange={(amount) =>
                    onCellChange({
                      incomeEntries: [{ incomeCategoryId: cat.id, month, amount }],
                    })
                  }
                />
              </div>
            </div>
          );
        }

        // FORMULA category
        return (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--c-black)]/80">{cat.name}</span>
              <span className="text-sm font-bold text-[var(--c-lavender)]">
                {formatMoney(catSummary?.amount ?? 0, baseCurrency)}
              </span>
            </div>
            <div className="ml-3 space-y-1.5">
              {cat.params.map((param) => {
                const val = param.values.find((v) => v.month === month);
                return (
                  <div key={param.id} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-[var(--c-black)]/50">
                      {param.name}
                    </span>
                    <div className="w-28">
                      <CurrencyInput
                        value={val?.value ?? 0}
                        currency=""
                        placeholder="0"
                        onChange={(value) =>
                          onCellChange({
                            formulaParamValues: [{ formulaParamId: param.id, month, value }],
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Tax and net income */}
      {summary && summary.tax > 0 && (
        <div className="flex items-center justify-between border-t border-[var(--c-black)]/10 pt-2">
          <span className="text-xs font-bold text-[var(--c-black)]/40">Налог</span>
          <span className="text-sm font-bold text-[var(--c-coral)]">
            −{formatMoney(summary.tax, baseCurrency)}
          </span>
        </div>
      )}
      {summary && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--c-black)]/40">Чистый доход</span>
          <span className="text-sm font-extrabold">
            {formatMoney(summary.netIncome, baseCurrency)}
          </span>
        </div>
      )}
    </Accordion>
  );
}

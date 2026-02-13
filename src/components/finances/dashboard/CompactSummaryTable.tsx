"use client";

import type { BudgetYearData, MonthSummary } from "@/lib/finances/types";
import { MONTH_LABELS, formatMoney } from "@/lib/finances/calculations";
import { cn } from "@/lib/utils";

interface CompactSummaryTableProps {
  data: BudgetYearData;
  summaries: MonthSummary[];
  selectedMonth: number;
}

export function CompactSummaryTable({ data, summaries, selectedMonth }: CompactSummaryTableProps) {
  type Row = {
    label: string;
    values: number[];
    bold?: boolean;
    negative?: boolean;
    highlighted?: boolean;
    section?: boolean;
  };

  const rows: Row[] = [];

  // Per-member net income
  for (const member of data.members) {
    rows.push({
      label: `${member.name} (чистый)`,
      values: summaries.map((s) => {
        const ms = s.memberSummaries.find((m) => m.memberId === member.id);
        return ms?.netIncome ?? 0;
      }),
    });
  }

  rows.push({
    label: "ИТОГО ДОХОД",
    values: summaries.map((s) => s.totalNetIncome),
    bold: true,
  });

  // Per-group expenses
  for (const group of data.expenseGroups) {
    rows.push({
      label: group.name,
      values: summaries.map((s) => {
        const gs = s.expenseGroupSummaries.find((g) => g.groupId === group.id);
        return gs?.amountInBaseCurrency ?? 0;
      }),
    });
  }

  rows.push({
    label: "ИТОГО РАСХОДЫ",
    values: summaries.map((s) => s.totalExpenses),
    bold: true,
    negative: true,
  });

  rows.push({
    label: "ОСТАТОК",
    values: summaries.map((s) => s.balance),
    bold: true,
    highlighted: true,
  });

  rows.push({
    label: "НАКОПИТЕЛЬНО",
    values: summaries.map((s) => s.cumulative),
    bold: true,
    highlighted: true,
  });

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 overflow-x-auto">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        Сводка за год
      </h3>
      <p className="mb-2 text-[9px] font-medium text-[var(--c-black)]/20 md:hidden">
        ← Прокрутите для просмотра всех месяцев →
      </p>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-2 text-left text-[10px] font-bold uppercase text-[var(--c-black)]/40 min-w-[140px]">
              Статья
            </th>
            {MONTH_LABELS.map((label, idx) => (
              <th
                key={label}
                className={cn(
                  "px-1 py-2 text-center text-[10px] font-bold uppercase min-w-[75px]",
                  idx + 1 === selectedMonth
                    ? "text-[var(--c-lavender)] bg-[var(--c-lavender)]/5"
                    : "text-[var(--c-black)]/40"
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={cn(row.bold && "border-t border-[var(--c-black)]/10")}>
              <td className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-1">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase",
                    row.bold && "text-[var(--c-black)]",
                    row.highlighted && "text-[var(--c-yellow)]",
                    !row.bold && !row.highlighted && "text-[var(--c-black)]/60"
                  )}
                >
                  {row.label}
                </span>
              </td>
              {row.values.map((val, idx) => (
                <td
                  key={idx}
                  className={cn(
                    "px-1 py-1 text-right text-[10px] tabular-nums",
                    idx + 1 === selectedMonth && "bg-[var(--c-lavender)]/5",
                    row.bold ? "font-extrabold" : "font-medium",
                    row.negative && val > 0 ? "text-[var(--c-coral)]" : "",
                    row.highlighted
                      ? val >= 0
                        ? "text-[var(--c-mint)]"
                        : "text-[var(--c-coral)]"
                      : ""
                  )}
                >
                  {val === 0 ? "" : formatMoney(val, data.baseCurrency)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

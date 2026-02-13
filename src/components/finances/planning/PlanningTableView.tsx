"use client";

import type { BudgetYearData, BulkUpsertInput } from "@/lib/finances/types";
import {
  computeYearSummary,
  MONTH_LABELS,
  computeCategoryIncome,
} from "@/lib/finances/calculations";
import { CurrencyInput } from "@/components/finances/shared/CurrencyInput";
import { cn } from "@/lib/utils";

interface PlanningTableViewProps {
  data: BudgetYearData;
  onCellChange: (entry: Partial<BulkUpsertInput>) => void;
}

export function PlanningTableView({ data, onCellChange }: PlanningTableViewProps) {
  const summaries = computeYearSummary(data);
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="overflow-x-auto rounded-3xl bg-[var(--c-gray)] p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-2 text-left text-[10px] font-bold uppercase text-[var(--c-black)]/40 min-w-[180px]">
              Статья
            </th>
            {MONTH_LABELS.map((label, idx) => (
              <th
                key={label}
                className={cn(
                  "px-1 py-2 text-center text-[10px] font-bold uppercase min-w-[85px]",
                  idx + 1 === currentMonth ? "text-[var(--c-lavender)]" : "text-[var(--c-black)]/40"
                )}
              >
                {label}
              </th>
            ))}
            <th className="px-1 py-2 text-center text-[10px] font-bold uppercase text-[var(--c-black)] min-w-[95px]">
              Итого
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Income per member */}
          {data.members.map((member) => (
            <MemberRows
              key={member.id}
              member={member}
              data={data}
              summaries={summaries}
              currentMonth={currentMonth}
              onCellChange={onCellChange}
            />
          ))}

          {/* Total income */}
          <SummaryRow
            label="ИТОГО ДОХОД"
            values={summaries.map((s) => s.totalNetIncome)}
            bold
            currentMonth={currentMonth}
            currency={data.baseCurrency}
          />

          {/* Expenses per group */}
          {data.expenseGroups.map((group) => (
            <GroupRows
              key={group.id}
              group={group}
              data={data}
              summaries={summaries}
              currentMonth={currentMonth}
              onCellChange={onCellChange}
            />
          ))}

          {/* Total expenses */}
          <SummaryRow
            label="ИТОГО РАСХОДЫ"
            values={summaries.map((s) => s.totalExpenses)}
            bold
            negative
            currentMonth={currentMonth}
            currency={data.baseCurrency}
          />

          {/* Balance */}
          <SummaryRow
            label="ОСТАТОК"
            values={summaries.map((s) => s.balance)}
            bold
            highlighted
            currentMonth={currentMonth}
            currency={data.baseCurrency}
          />

          {/* Cumulative */}
          <SummaryRow
            label="НАКОПИТЕЛЬНО"
            values={summaries.map((s) => s.cumulative)}
            bold
            highlighted
            currentMonth={currentMonth}
            currency={data.baseCurrency}
          />
        </tbody>
      </table>
    </div>
  );
}

function MemberRows({
  member,
  data,
  summaries,
  currentMonth,
  onCellChange,
}: {
  member: BudgetYearData["members"][0];
  data: BudgetYearData;
  summaries: ReturnType<typeof computeYearSummary>;
  currentMonth: number;
  onCellChange: (entry: Partial<BulkUpsertInput>) => void;
}) {
  return (
    <>
      {/* Section header */}
      <tr>
        <td colSpan={14} className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 pt-4 pb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--c-lavender)]">
            {member.name}
          </span>
        </td>
      </tr>

      {member.incomeCategories.map((cat) => {
        if (cat.type === "FIXED") {
          const values = Array.from({ length: 12 }, (_, i) => {
            const entry = cat.entries.find((e) => e.month === i + 1);
            return entry?.amount ?? 0;
          });
          return (
            <EditableRow
              key={cat.id}
              label={cat.name}
              values={values}
              currentMonth={currentMonth}
              currency={data.baseCurrency}
              onCellChange={(month, amount) =>
                onCellChange({ incomeEntries: [{ incomeCategoryId: cat.id, month, amount }] })
              }
            />
          );
        }

        // FORMULA: show computed values (read-only)
        const values = Array.from({ length: 12 }, (_, i) => computeCategoryIncome(cat, i + 1));
        return (
          <SummaryRow
            key={cat.id}
            label={`${cat.name} ⨍`}
            values={values}
            currentMonth={currentMonth}
            currency={data.baseCurrency}
          />
        );
      })}

      {/* Member net income */}
      <SummaryRow
        label={`Чистый доход ${member.name}`}
        values={summaries.map((s) => {
          const ms = s.memberSummaries.find((m) => m.memberId === member.id);
          return ms?.netIncome ?? 0;
        })}
        bold
        currentMonth={currentMonth}
        currency={data.baseCurrency}
      />
    </>
  );
}

function GroupRows({
  group,
  data,
  summaries,
  currentMonth,
  onCellChange,
}: {
  group: BudgetYearData["expenseGroups"][0];
  data: BudgetYearData;
  summaries: ReturnType<typeof computeYearSummary>;
  currentMonth: number;
  onCellChange: (entry: Partial<BulkUpsertInput>) => void;
}) {
  return (
    <>
      <tr>
        <td colSpan={14} className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 pt-4 pb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--c-coral)]">
            {group.name} ({group.currency})
          </span>
        </td>
      </tr>

      {group.categories.map((cat) => {
        const values = Array.from({ length: 12 }, (_, i) => {
          const entry = cat.entries.find((e) => e.month === i + 1);
          return entry?.amount ?? 0;
        });
        return (
          <EditableRow
            key={cat.id}
            label={cat.name}
            values={values}
            currentMonth={currentMonth}
            currency={group.currency}
            onCellChange={(month, amount) =>
              onCellChange({ expenseEntries: [{ expenseCategoryId: cat.id, month, amount }] })
            }
          />
        );
      })}

      {/* Group total in base currency */}
      <SummaryRow
        label={`Итого ${group.name}`}
        values={summaries.map((s) => {
          const gs = s.expenseGroupSummaries.find((g) => g.groupId === group.id);
          return gs?.amountInBaseCurrency ?? 0;
        })}
        bold
        currentMonth={currentMonth}
        currency={data.baseCurrency}
      />
    </>
  );
}

function EditableRow({
  label,
  values,
  currentMonth,
  currency,
  onCellChange,
}: {
  label: string;
  values: number[];
  currentMonth: number;
  currency: string;
  onCellChange: (month: number, amount: number) => void;
}) {
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <tr>
      <td className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-0.5">
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </td>
      {values.map((val, idx) => (
        <td
          key={idx}
          className={cn("px-0.5 py-0.5", idx + 1 === currentMonth && "bg-[var(--c-lavender)]/5")}
        >
          <CurrencyInput
            value={val}
            currency={currency}
            onChange={(amount) => onCellChange(idx + 1, amount)}
            className="text-xs"
          />
        </td>
      ))}
      <td className="px-0.5 py-0.5">
        <CurrencyInput value={total} currency={currency} readOnly bold className="text-xs" />
      </td>
    </tr>
  );
}

function SummaryRow({
  label,
  values,
  bold,
  negative,
  highlighted,
  currentMonth,
  currency,
}: {
  label: string;
  values: number[];
  bold?: boolean;
  negative?: boolean;
  highlighted?: boolean;
  currentMonth: number;
  currency: string;
}) {
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <tr className={cn(bold && "border-t border-[var(--c-black)]/10")}>
      <td className="sticky left-0 z-10 bg-[var(--c-gray)] px-3 py-0.5">
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
            bold ? "bg-[var(--c-black)] text-white" : "",
            highlighted ? "bg-[var(--c-yellow)] text-[var(--c-black)]" : ""
          )}
        >
          {label}
        </span>
      </td>
      {values.map((val, idx) => (
        <td
          key={idx}
          className={cn("px-0.5 py-0.5", idx + 1 === currentMonth && "bg-[var(--c-lavender)]/5")}
        >
          <CurrencyInput
            value={val}
            currency={currency}
            readOnly
            bold={bold}
            negative={negative}
            highlighted={highlighted}
            className="text-xs"
          />
        </td>
      ))}
      <td className="px-0.5 py-0.5">
        <CurrencyInput
          value={total}
          currency={currency}
          readOnly
          bold
          negative={negative}
          highlighted={highlighted}
          className="text-xs"
        />
      </td>
    </tr>
  );
}

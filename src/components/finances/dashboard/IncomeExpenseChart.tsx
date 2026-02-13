"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { MonthSummary } from "@/lib/finances/types";
import { MONTH_LABELS, formatMoney, insightIncomeExpense } from "@/lib/finances/calculations";

interface IncomeExpenseChartProps {
  summaries: MonthSummary[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

export function IncomeExpenseChart({
  summaries,
  selectedMonth,
  onSelectMonth,
}: IncomeExpenseChartProps) {
  const [showComparison, setShowComparison] = useState(false);

  const chartData = summaries.map((s, idx) => {
    const prev = idx > 0 ? summaries[idx - 1] : null;
    return {
      name: MONTH_LABELS[idx],
      month: idx + 1,
      income: s.totalNetIncome,
      expenses: s.totalExpenses,
      prevIncome: prev ? prev.totalNetIncome : 0,
      prevExpenses: prev ? prev.totalExpenses : 0,
    };
  });

  const insight = insightIncomeExpense(summaries, selectedMonth);

  const tooltipLabelMap: Record<string, string> = {
    income: "Доход",
    expenses: "Расходы",
    prevIncome: "Доход (пред. мес.)",
    prevExpenses: "Расходы (пред. мес.)",
  };

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-5 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[var(--c-black)]">
            Доходы и расходы
          </h3>
          <p className="mt-1 text-xs font-medium text-[var(--c-black)]/40">{insight}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowComparison((v) => !v)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer",
            showComparison
              ? "bg-[var(--c-black)]/10 text-[var(--c-black)]/70"
              : "bg-[var(--c-black)]/5 text-[var(--c-black)]/30 hover:bg-[var(--c-black)]/8"
          )}
        >
          Сравнение
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          onClick={(e) => {
            const payload = (e as Record<string, unknown>)?.activePayload as
              | Array<{ payload: { month: number } }>
              | undefined;
            if (payload?.[0]?.payload?.month) {
              onSelectMonth(payload[0].payload.month);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            formatter={
              ((value: number, name: string) => [
                formatMoney(value),
                tooltipLabelMap[name] ?? name,
              ]) as never
            }
            labelFormatter={(label) => label}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />

          {/* Ghost bars for comparison (previous month) - rendered BEFORE real bars */}
          {showComparison && (
            <>
              <Bar dataKey="prevIncome" radius={[4, 4, 0, 0]} maxBarSize={16} opacity={0.2}>
                {chartData.map((entry) => (
                  <Cell key={`prev-inc-${entry.month}`} fill="#45d9b4" />
                ))}
              </Bar>
              <Bar dataKey="prevExpenses" radius={[4, 4, 0, 0]} maxBarSize={16} opacity={0.2}>
                {chartData.map((entry) => (
                  <Cell key={`prev-exp-${entry.month}`} fill="#ff6b6b" />
                ))}
              </Bar>
            </>
          )}

          <Bar dataKey="income" radius={[4, 4, 0, 0]} maxBarSize={showComparison ? 16 : 24}>
            {chartData.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.month === selectedMonth ? "#2dd4a0" : "#45d9b4"}
                opacity={entry.month === selectedMonth ? 1 : 0.6}
              />
            ))}
          </Bar>
          <Bar dataKey="expenses" radius={[4, 4, 0, 0]} maxBarSize={showComparison ? 16 : 24}>
            {chartData.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.month === selectedMonth ? "#ff5252" : "#ff6b6b"}
                opacity={entry.month === selectedMonth ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

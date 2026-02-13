"use client";

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
import type { MonthSummary } from "@/lib/finances/types";
import { MONTH_LABELS, formatMoney } from "@/lib/finances/calculations";

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
  const chartData = summaries.map((s, idx) => ({
    name: MONTH_LABELS[idx],
    month: idx + 1,
    income: s.totalNetIncome,
    expenses: s.totalExpenses,
  }));

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        Доходы vs Расходы
      </h3>
      <ResponsiveContainer width="100%" height={250}>
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
                name === "income" ? "Доход" : "Расходы",
              ]) as never
            }
            labelFormatter={(label) => label}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="income" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {chartData.map((entry) => (
              <Cell
                key={entry.month}
                fill={entry.month === selectedMonth ? "#2dd4a0" : "#45d9b4"}
                opacity={entry.month === selectedMonth ? 1 : 0.6}
              />
            ))}
          </Bar>
          <Bar dataKey="expenses" radius={[4, 4, 0, 0]} maxBarSize={24}>
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

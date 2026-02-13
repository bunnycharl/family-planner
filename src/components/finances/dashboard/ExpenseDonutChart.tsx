"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { MonthSummary } from "@/lib/finances/types";
import { formatMoney, insightDonut } from "@/lib/finances/calculations";

interface ExpenseDonutChartProps {
  summary: MonthSummary | null;
  baseCurrency: string;
}

const COLORS = [
  "var(--c-coral)",
  "var(--c-lavender)",
  "var(--c-yellow)",
  "var(--c-mint)",
  "#3b82f6",
  "#f97316",
];

export function ExpenseDonutChart({ summary, baseCurrency }: ExpenseDonutChartProps) {
  if (!summary) return null;

  const chartData = summary.expenseGroupSummaries
    .filter((g) => g.amountInBaseCurrency > 0)
    .map((g) => ({
      name: g.groupName,
      value: g.amountInBaseCurrency,
    }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-sm font-bold uppercase text-[var(--c-black)]/20">Нет расходов</p>
      </div>
    );
  }

  // Find the top group for center label
  const topGroup = chartData.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        {insightDonut(summary, baseCurrency)}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ x, y, percent, index }) => {
              const p = percent ?? 0;
              const i = typeof index === "number" ? index : 0;
              if (p < 0.05) return null;
              return (
                <text
                  x={x as number}
                  y={y as number}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[9px] font-bold"
                  fill={COLORS[i % COLORS.length]}
                >
                  {Math.round(p * 100)}%
                </text>
              );
            }}
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={((value: number) => formatMoney(value, baseCurrency)) as never}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-[var(--c-black)]/40"
          >
            {topGroup.name}
          </text>
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-extrabold fill-[var(--c-black)]"
          >
            {formatMoney(total, baseCurrency)}
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 justify-center">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-[10px] font-bold text-[var(--c-black)]/60">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthSummary } from "@/lib/finances/types";
import { MONTH_LABELS, formatMoney, insightCumulative } from "@/lib/finances/calculations";

interface CumulativeChartProps {
  summaries: MonthSummary[];
  baseCurrency: string;
  selectedMonth: number;
}

export function CumulativeChart({ summaries, baseCurrency, selectedMonth }: CumulativeChartProps) {
  const chartData = summaries.map((s, idx) => ({
    name: MONTH_LABELS[idx],
    value: s.cumulative,
  }));

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] p-4 md:p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--c-black)]/40">
        {insightCumulative(summaries, selectedMonth, baseCurrency)}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            formatter={
              ((value: number) => [formatMoney(value, baseCurrency), "Накоплено"]) as never
            }
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <ReferenceLine y={0} stroke="rgba(0,0,0,0.2)" strokeDasharray="4 4" />
          <defs>
            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#45d9b4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#45d9b4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#45d9b4"
            strokeWidth={2}
            fill="url(#cumulativeGradient)"
            dot={{ r: 4, fill: "#45d9b4", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

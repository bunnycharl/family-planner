"use client";

import { formatMoney, MONTH_LABELS } from "@/lib/finances/calculations";

interface TransactionSummaryCardProps {
  totalAmount: number;
  transactionCount: number;
  baseCurrency: string;
  selectedMonth: number;
}

export function TransactionSummaryCard({
  totalAmount,
  transactionCount,
  baseCurrency,
  selectedMonth,
}: TransactionSummaryCardProps) {
  const monthLabel = MONTH_LABELS[selectedMonth - 1] ?? "";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[var(--c-coral)] p-6 text-white">
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">
          Потрачено в {monthLabel}
        </p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          {formatMoney(totalAmount, baseCurrency)}
        </p>
        <p className="mt-1 text-sm font-medium opacity-80">
          {transactionCount}{" "}
          {transactionCount === 1
            ? "операция"
            : transactionCount >= 2 && transactionCount <= 4
              ? "операции"
              : "операций"}
        </p>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-5 -right-5 h-28 w-28 rounded-full bg-white/10" />
    </div>
  );
}

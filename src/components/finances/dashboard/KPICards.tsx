"use client";

import { cn } from "@/lib/utils";
import type { MonthSummary } from "@/lib/finances/types";
import { formatMoney } from "@/lib/finances/calculations";

interface KPICardsProps {
  summary: MonthSummary | null;
  prevSummary: MonthSummary | null;
  baseCurrency: string;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export function KPICards({ summary, prevSummary, baseCurrency }: KPICardsProps) {
  if (!summary) return null;

  const cards = [
    {
      label: "Доходы",
      value: summary.totalNetIncome,
      color: "var(--c-mint)",
      bgClass: "bg-[var(--c-mint)]/10",
      prev: prevSummary?.totalNetIncome,
    },
    {
      label: "Расходы",
      value: summary.totalExpenses,
      color: "var(--c-coral)",
      bgClass: "bg-[var(--c-coral)]/10",
      prev: prevSummary?.totalExpenses,
    },
    {
      label: "Остаток",
      value: summary.balance,
      color: summary.balance >= 0 ? "var(--c-mint)" : "var(--c-coral)",
      bgClass: summary.balance >= 0 ? "bg-[var(--c-mint)]/10" : "bg-[var(--c-coral)]/10",
      prev: null,
    },
    {
      label: "Накоплено",
      value: summary.cumulative,
      color: "var(--c-yellow)",
      bgClass: "bg-[var(--c-yellow)]/10",
      prev: null,
      subtitle: "с начала года",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const change = card.prev != null ? pctChange(card.value, card.prev) : null;
        return (
          <div key={card.label} className={cn("rounded-3xl p-4 md:p-5 space-y-1", card.bgClass)}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--c-black)]/40">
              {card.label}
            </p>
            <p className="text-lg md:text-xl font-extrabold" style={{ color: card.color }}>
              {formatMoney(card.value, baseCurrency)}
            </p>
            {change !== null && (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  change >= 0 ? "text-[var(--c-success)]" : "text-[var(--c-error)]"
                )}
              >
                {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% к пред. мес
              </p>
            )}
            {card.subtitle && (
              <p className="text-[10px] font-medium text-[var(--c-black)]/30">{card.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

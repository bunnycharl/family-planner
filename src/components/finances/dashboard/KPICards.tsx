"use client";

import { useState } from "react";
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

function renderDrillDown(
  label: string,
  summary: MonthSummary,
  baseCurrency: string
): React.ReactNode {
  if (label === "Расходы") {
    const groups = [...summary.expenseGroupSummaries].sort(
      (a, b) => b.amountInBaseCurrency - a.amountInBaseCurrency
    );
    if (groups.length === 0) return null;
    return (
      <div className="mt-2 pt-2 border-t border-[var(--c-black)]/10 space-y-1">
        {groups.map((g) => (
          <div key={g.groupId} className="flex justify-between text-[10px]">
            <span className="font-medium text-[var(--c-black)]/60">{g.groupName}</span>
            <span className="font-bold">{formatMoney(g.amountInBaseCurrency, baseCurrency)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (label === "Доходы") {
    const members = summary.memberSummaries;
    if (members.length === 0) return null;
    return (
      <div className="mt-2 pt-2 border-t border-[var(--c-black)]/10 space-y-1">
        {members.map((m) => (
          <div key={m.memberId} className="flex justify-between text-[10px]">
            <span className="font-medium text-[var(--c-black)]/60">{m.memberName}</span>
            <span className="font-bold">{formatMoney(m.netIncome, baseCurrency)}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export function KPICards({ summary, prevSummary, baseCurrency }: KPICardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
        const isExpanded = expandedCard === card.label;
        return (
          <div
            key={card.label}
            className={cn(
              "rounded-3xl p-4 md:p-5 space-y-1 cursor-pointer transition-shadow",
              card.bgClass,
              isExpanded && "ring-2 ring-[var(--c-lavender)]"
            )}
            onClick={() => setExpandedCard(isExpanded ? null : card.label)}
          >
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
            {isExpanded && renderDrillDown(card.label, summary, baseCurrency)}
          </div>
        );
      })}
    </div>
  );
}

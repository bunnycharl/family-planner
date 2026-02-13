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

function renderDrillDown(label: string, summary: MonthSummary, isHero: boolean): React.ReactNode {
  const textMuted = isHero ? "text-white/60" : "text-[var(--c-black)]/60";
  const textBold = isHero ? "text-white" : "";

  if (label === "Расходы") {
    const groups = [...summary.expenseGroupSummaries].sort(
      (a, b) => b.amountInBaseCurrency - a.amountInBaseCurrency
    );
    if (groups.length === 0) return null;
    return (
      <div
        className={cn(
          "mt-3 pt-3 space-y-1.5",
          isHero ? "border-t border-white/20" : "border-t border-[var(--c-black)]/10"
        )}
      >
        {groups.map((g) => (
          <div key={g.groupId} className="flex justify-between text-xs">
            <span className={cn("font-medium", textMuted)}>{g.groupName}</span>
            <span className={cn("font-bold", textBold)}>{formatMoney(g.amountInBaseCurrency)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (label === "Доходы") {
    const users = summary.userSummaries;
    if (users.length === 0) return null;
    return (
      <div
        className={cn(
          "mt-3 pt-3 space-y-1.5",
          isHero ? "border-t border-white/20" : "border-t border-[var(--c-black)]/10"
        )}
      >
        {users.map((u) => (
          <div key={u.userId} className="flex justify-between text-xs">
            <span className={cn("font-medium", textMuted)}>{u.userName}</span>
            <span className={cn("font-bold", textBold)}>{formatMoney(u.netIncome)}</span>
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

  const balancePositive = summary.balance >= 0;

  const cards = [
    {
      label: "Остаток",
      value: summary.balance,
      bg: balancePositive ? "bg-[var(--c-mint)]" : "bg-[var(--c-coral)]",
      hero: true,
      prev: null,
    },
    {
      label: "Доходы",
      value: summary.totalNetIncome,
      bg: "bg-[var(--c-mint)]/15",
      hero: false,
      prev: prevSummary?.totalNetIncome,
    },
    {
      label: "Расходы",
      value: summary.totalExpenses,
      bg: "bg-[var(--c-coral)]/15",
      hero: false,
      prev: prevSummary?.totalExpenses,
    },
    {
      label: "Накоплено",
      value: summary.cumulative,
      bg: "bg-[var(--c-yellow)]/15",
      hero: false,
      prev: null,
      subtitle: "с начала года",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const change = card.prev != null ? pctChange(card.value, card.prev) : null;
        const isExpanded = expandedCard === card.label;
        const isHero = card.hero;

        return (
          <div
            key={card.label}
            className={cn(
              "relative overflow-hidden rounded-3xl cursor-pointer transition-all",
              card.bg,
              isHero
                ? "col-span-2 lg:col-span-1 p-6 md:p-8 min-h-[160px] flex flex-col justify-between shadow-lg"
                : "p-5 md:p-6 space-y-1",
              isExpanded && !isHero && "ring-2 ring-[var(--c-lavender)]",
              isExpanded && isHero && "ring-2 ring-white/40"
            )}
            onClick={() => setExpandedCard(isExpanded ? null : card.label)}
          >
            {/* Decorative circle for hero card */}
            {isHero && (
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />
            )}

            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                isHero ? "text-white/70" : "text-[var(--c-black)]/40"
              )}
            >
              {card.label}
            </p>

            <p
              className={cn(
                "font-extrabold tracking-tight",
                isHero
                  ? "text-3xl md:text-4xl text-white mt-auto"
                  : "text-xl md:text-2xl text-[var(--c-black)]"
              )}
            >
              {formatMoney(card.value, baseCurrency)}
            </p>

            {change !== null && (
              <p
                className={cn(
                  "text-xs font-bold mt-1",
                  isHero
                    ? "text-white/80"
                    : change >= 0
                      ? "text-[var(--c-success)]"
                      : "text-[var(--c-error)]"
                )}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% к пред. мес
              </p>
            )}

            {card.subtitle && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  isHero ? "text-white/60" : "text-[var(--c-black)]/30"
                )}
              >
                {card.subtitle}
              </p>
            )}

            {isExpanded && renderDrillDown(card.label, summary, isHero)}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MONTH_LABELS } from "@/lib/finances/calculations";

interface MonthNavigatorProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

export function MonthNavigator({ selectedMonth, onSelect }: MonthNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector("[data-active='true']");
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedMonth]);

  return (
    <div ref={containerRef} className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
      {MONTH_LABELS.map((label, idx) => {
        const month = idx + 1;
        const isActive = selectedMonth === month;
        const isCurrent = currentMonth === month;
        return (
          <button
            key={month}
            type="button"
            data-active={isActive}
            onClick={() => onSelect(month)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
              isActive
                ? "bg-[var(--c-lavender)] text-white"
                : isCurrent
                  ? "bg-[var(--c-yellow)]/30 text-[var(--c-black)] hover:bg-[var(--c-yellow)]/50"
                  : "bg-[var(--c-gray)] text-[var(--c-black)]/60 hover:bg-[var(--c-gray)] hover:text-[var(--c-black)]"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

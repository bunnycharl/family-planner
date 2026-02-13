"use client";

import { cn } from "@/lib/utils";

interface YearSelectorProps {
  year: number;
  onChange: (year: number) => void;
  minYear?: number;
  maxYear?: number;
}

export function YearSelector({
  year,
  onChange,
  minYear = 2024,
  maxYear = 2035,
}: YearSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(year - 1)}
        disabled={year <= minYear}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer",
          "bg-[var(--c-gray)] text-[var(--c-black)] hover:bg-[var(--c-black)] hover:text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        ◀
      </button>
      <span className="min-w-[60px] text-center text-lg font-extrabold tabular-nums">{year}</span>
      <button
        type="button"
        onClick={() => onChange(year + 1)}
        disabled={year >= maxYear}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer",
          "bg-[var(--c-gray)] text-[var(--c-black)] hover:bg-[var(--c-black)] hover:text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        ▶
      </button>
    </div>
  );
}

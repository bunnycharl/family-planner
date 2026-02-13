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
          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer",
          "bg-[var(--c-black)] text-white hover:opacity-80",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="min-w-[80px] text-center text-2xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
        {year}
      </span>

      <button
        type="button"
        onClick={() => onChange(year + 1)}
        disabled={year >= maxYear}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer",
          "bg-[var(--c-black)] text-white hover:opacity-80",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

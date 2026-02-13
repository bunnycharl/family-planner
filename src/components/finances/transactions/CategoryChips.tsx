"use client";

import { cn } from "@/lib/utils";
import type { TransactionCategoryData } from "@/lib/finances/types";

interface CategoryChipsProps {
  categories: TransactionCategoryData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
          selectedId === null
            ? "bg-[var(--c-black)] text-white"
            : "border-2 border-[var(--c-black)]/20 bg-[var(--c-white)] text-[var(--c-black)] hover:border-[var(--c-black)]/40"
        )}
      >
        Все
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap",
            selectedId === cat.id
              ? "text-white"
              : "border-2 border-[var(--c-black)]/20 bg-[var(--c-white)] text-[var(--c-black)] hover:border-[var(--c-black)]/40"
          )}
          style={selectedId === cat.id ? { backgroundColor: cat.color } : undefined}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

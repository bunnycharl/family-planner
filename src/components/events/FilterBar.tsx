"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Filters {
  categoryId?: string;
  start?: string;
  end?: string;
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: Category[];
}

export function FilterBar({ filters, onFiltersChange, categories }: FilterBarProps) {
  const hasActiveFilters = filters.categoryId || filters.start || filters.end;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    }
    if (categoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoryOpen]);

  function handleClear() {
    onFiltersChange({});
  }

  const selectedCategory = categories.find((c) => c.id === filters.categoryId);

  return (
    <div className="space-y-3 p-4 bg-[var(--c-gray)] rounded-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-bold uppercase text-[var(--c-black)]">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Фильтры
      </div>

      {/* Category picker */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-[#999]">Категория</span>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setCategoryOpen(!categoryOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border-2 border-[var(--c-black)] px-4 py-3 text-sm font-medium",
              "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]",
              "bg-white text-left transition-all cursor-pointer"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedCategory ? (
                <>
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="text-[var(--c-black)] font-bold">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-[#999]">Все категории</span>
              )}
            </span>
            <svg
              className={cn(
                "h-4 w-4 shrink-0 text-[#999] transition-transform",
                categoryOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {categoryOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-3xl bg-white shadow-xl">
              {/* "All" option */}
              <button
                type="button"
                onClick={() => {
                  onFiltersChange({ ...filters, categoryId: undefined });
                  setCategoryOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-bold uppercase transition-colors cursor-pointer first:rounded-t-3xl",
                  !filters.categoryId
                    ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                    : "text-[var(--c-black)] hover:bg-[var(--c-gray)]"
                )}
              >
                <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-[#999]" />
                Все категории
              </button>

              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onFiltersChange({ ...filters, categoryId: cat.id });
                    setCategoryOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-bold uppercase transition-colors cursor-pointer",
                    idx === categories.length - 1 && "last:rounded-b-3xl",
                    filters.categoryId === cat.id
                      ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                      : "text-[var(--c-black)] hover:bg-[var(--c-gray)]"
                  )}
                >
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-start"
            className="text-xs font-bold uppercase tracking-wide text-[#999]"
          >
            С
          </label>
          <input
            id="filter-start"
            type="date"
            value={filters.start ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                start: e.target.value || undefined,
              })
            }
            className={cn(
              "w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-3 text-sm font-medium",
              "text-[var(--c-black)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]",
              "[&::-webkit-date-and-time-value]:text-left"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-end"
            className="text-xs font-bold uppercase tracking-wide text-[#999]"
          >
            По
          </label>
          <input
            id="filter-end"
            type="date"
            value={filters.end ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                end: e.target.value || undefined,
              })
            }
            className={cn(
              "w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-3 text-sm font-medium",
              "text-[var(--c-black)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]",
              "[&::-webkit-date-and-time-value]:text-left"
            )}
          />
        </div>
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "w-full rounded-full px-4 py-3 text-sm font-bold uppercase",
            "text-[var(--c-coral)] bg-white",
            "border-2 border-[var(--c-coral)]",
            "hover:bg-[var(--c-coral)] hover:text-white",
            "transition-all cursor-pointer"
          )}
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}

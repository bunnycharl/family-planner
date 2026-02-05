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

export function FilterBar({
  filters,
  onFiltersChange,
  categories,
}: FilterBarProps) {
  const hasActiveFilters = filters.categoryId || filters.start || filters.end;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }
    if (categoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoryOpen]);

  function handleClear() {
    onFiltersChange({});
  }

  const selectedCategory = categories.find(
    (c) => c.id === filters.categoryId
  );

  return (
    <div className="space-y-2 p-3 bg-white rounded-lg shadow-sm">
      {/* Row 1: Category picker */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Категория</span>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setCategoryOpen(!categoryOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2.5 text-base",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "bg-white text-left"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedCategory ? (
                <>
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="text-gray-900">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-gray-500">Все категории</span>
              )}
            </span>
            <svg
              className={cn(
                "h-4 w-4 shrink-0 text-gray-400 transition-transform",
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
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-white shadow-lg">
              {/* "All" option */}
              <button
                type="button"
                onClick={() => {
                  onFiltersChange({ ...filters, categoryId: undefined });
                  setCategoryOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors",
                  !filters.categoryId
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-gray-300" />
                Все категории
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onFiltersChange({ ...filters, categoryId: cat.id });
                    setCategoryOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors",
                    filters.categoryId === cat.id
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
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

      {/* Row 2: Date range */}
      <div className="grid grid-cols-2 gap-2 overflow-hidden">
        <div className="flex flex-col gap-1 min-w-0">
          <label
            htmlFor="filter-start"
            className="text-xs font-medium text-gray-500"
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
              "w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "[&::-webkit-date-and-time-value]:text-left"
            )}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <label
            htmlFor="filter-end"
            className="text-xs font-medium text-gray-500"
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
              "w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "[&::-webkit-date-and-time-value]:text-left"
            )}
          />
        </div>
      </div>

      {/* Row 3: Clear button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "w-full rounded-md px-3 py-2 text-sm font-medium",
            "text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          )}
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
}

"use client";

interface GanttLegendProps {
  categories: { name: string; color: string }[];
}

export function GanttLegend({ categories }: GanttLegendProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <div
          key={category.name}
          className="flex items-center gap-1.5 rounded-full bg-[var(--c-gray)] px-3 py-1 text-xs font-bold"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-[var(--c-black)]">{category.name}</span>
        </div>
      ))}
    </div>
  );
}

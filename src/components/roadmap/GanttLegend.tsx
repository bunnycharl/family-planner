"use client";

interface TaskTypeInfo {
  key: string;
  label: string;
  color: string;
}

interface GanttLegendProps {
  taskTypes: TaskTypeInfo[];
}

export function GanttLegend({ taskTypes }: GanttLegendProps) {
  if (taskTypes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {taskTypes.map((type) => (
        <div
          key={type.key}
          className="flex items-center gap-1.5 rounded-full bg-[var(--c-gray)] px-3 py-1 text-xs font-bold"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: type.color }}
          />
          <span className="text-[var(--c-black)]">{type.label}</span>
        </div>
      ))}
    </div>
  );
}

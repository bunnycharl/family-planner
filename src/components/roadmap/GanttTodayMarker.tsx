"use client";

interface GanttTodayMarkerProps {
  columnIndex: number;
  totalColumns: number;
}

export function GanttTodayMarker({ columnIndex, totalColumns }: GanttTodayMarkerProps) {
  if (columnIndex < 0 || totalColumns === 0) return null;

  const leftPercent = ((columnIndex + 0.5) / totalColumns) * 100;

  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10 flex flex-col items-center"
      style={{ left: `${leftPercent}%` }}
    >
      {/* Label */}
      <div className="absolute -top-6 -translate-x-1/2 bg-[var(--c-coral)] text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-md">
        Сегодня
      </div>
      {/* Line */}
      <div className="w-0.5 h-full bg-[var(--c-coral)] shadow-lg opacity-80" />
    </div>
  );
}

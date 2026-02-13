"use client";

interface RoadmapToolbarProps {
  year: number;
  onYearChange: (year: number) => void;
  onAddPhase: () => void;
  onAddTask: () => void;
  hasPhases: boolean;
}

export function RoadmapToolbar({
  year,
  onYearChange,
  onAddPhase,
  onAddTask,
  hasPhases,
}: RoadmapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Year selector */}
      <div className="flex items-center gap-1 rounded-full border-2 border-[var(--c-black)] overflow-hidden">
        <button
          type="button"
          onClick={() => onYearChange(year - 1)}
          className="px-3 py-2 text-xs font-bold text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
        >
          ◀
        </button>
        <span className="px-3 py-2 text-xs font-bold uppercase text-[var(--c-black)] bg-[var(--c-yellow)]">
          {year}
        </span>
        <button
          type="button"
          onClick={() => onYearChange(year + 1)}
          className="px-3 py-2 text-xs font-bold text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
        >
          ▶
        </button>
      </div>

      <div className="flex-1" />

      {/* Add buttons */}
      <button
        type="button"
        onClick={onAddPhase}
        className="flex items-center gap-2 rounded-full border-2 border-dashed border-[var(--c-black)] px-4 py-2 text-xs font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-all cursor-pointer"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Фаза
      </button>

      <button
        type="button"
        onClick={onAddTask}
        disabled={!hasPhases}
        className="flex items-center gap-2 rounded-full border-2 border-[var(--c-black)] px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer bg-[var(--c-black)] text-white hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Задача
      </button>
    </div>
  );
}

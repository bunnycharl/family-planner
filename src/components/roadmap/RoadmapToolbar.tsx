"use client";

import { cn } from "@/lib/utils";
import type { ZoomLevel } from "@/lib/roadmap-utils";

interface RoadmapToolbarProps {
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  onAddPhase: () => void;
  onAddMilestone: () => void;
  hasPhases: boolean;
  isMobile: boolean;
}

const ZOOM_OPTIONS: { value: ZoomLevel; label: string }[] = [
  { value: "month", label: "Месяц" },
  { value: "quarter", label: "Квартал" },
  { value: "year", label: "Год" },
];

export function RoadmapToolbar({
  zoom,
  onZoomChange,
  onAddPhase,
  onAddMilestone,
  hasPhases,
  isMobile,
}: RoadmapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Zoom selector — hidden on mobile */}
      {!isMobile && (
        <div className="flex rounded-full border-2 border-[var(--c-black)] overflow-hidden">
          {ZOOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onZoomChange(opt.value)}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
                zoom === opt.value
                  ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                  : "bg-white text-[#666] hover:bg-[var(--c-gray)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

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
        onClick={onAddMilestone}
        disabled={!hasPhases}
        className={cn(
          "flex items-center gap-2 rounded-full border-2 border-[var(--c-black)] px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer",
          "bg-[var(--c-black)] text-white hover:opacity-80",
          "disabled:cursor-not-allowed disabled:opacity-40"
        )}
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
        Веха
      </button>
    </div>
  );
}

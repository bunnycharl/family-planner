"use client";

import { cn } from "@/lib/utils";

interface EventChipEvent {
  id: string;
  title: string;
  itemType?: "event" | "task";
  taskStatus?: "TODO" | "IN_PROGRESS" | "DONE";
  category?: {
    color: string;
  } | null;
}

interface EventChipProps {
  event: EventChipEvent;
  onClick?: (event: EventChipEvent) => void;
}

export function EventChip({ event, onClick }: EventChipProps) {
  const isTask = event.itemType === "task";
  const isDone = event.taskStatus === "DONE";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "w-full text-left text-[11px] font-medium px-2 py-1 rounded-lg truncate",
        "cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02]",
        isTask && isDone && "opacity-60 line-through",
        isTask && "border-l-2 border-dashed"
      )}
      style={{
        backgroundColor: `${event.category?.color ?? "#0D9488"}15`,
        borderLeftColor: event.category?.color ?? "#0D9488",
        color: event.category?.color ?? "#0D9488",
      }}
    >
      {isTask && (
        <span className="mr-1 inline-flex h-3.5 w-3.5 items-center justify-center">
          {isDone ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          )}
        </span>
      )}
      {event.title}
    </button>
  );
}

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

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "w-full text-left text-xs px-1 py-0.5 rounded truncate",
        "cursor-pointer hover:opacity-80 transition-opacity",
        isTask
          ? "border-l-2 border-dashed bg-amber-50/50"
          : "border-l-2 bg-gray-50"
      )}
      style={{
        borderLeftColor: event.category?.color ?? "#9ca3af",
      }}
    >
      {isTask && (
        <span className="mr-0.5 text-[10px]">
          {event.taskStatus === "DONE" ? "\u2611" : "\u2610"}
        </span>
      )}
      {event.title}
    </button>
  );
}

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
        "w-full text-left text-[11px] font-bold px-2 py-1 rounded-full truncate uppercase",
        "cursor-pointer transition-all hover:scale-[1.02]",
        isDone && "opacity-50 line-through"
      )}
      style={{
        backgroundColor: event.category?.color ?? "#000000",
        color: "#FFFFFF",
      }}
    >
      {isTask && <span className="mr-1">{isDone ? "\u2713" : "\u25A1"}</span>}
      {event.title}
    </button>
  );
}

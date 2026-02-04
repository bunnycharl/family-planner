"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EventCardEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  category?: {
    name: string;
    color: string;
  } | null;
  createdBy: {
    name: string;
    avatarColor: string;
  };
  assignees?: {
    id: string;
    name: string;
    avatarColor: string;
  }[];
}

interface EventCardProps {
  event: EventCardEvent;
  onClick?: (event: EventCardEvent) => void;
}

function formatEventDate(event: EventCardEvent): string {
  const start = new Date(event.startDate);

  if (event.endDate) {
    const end = new Date(event.endDate);
    const sameDay =
      format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

    if (!sameDay) {
      return `${format(start, "d MMM", { locale: ru })} \u2013 ${format(end, "d MMM yyyy", { locale: ru })}`;
    }
  }

  return format(start, "d MMM yyyy", { locale: ru });
}

export function EventCard({ event, onClick }: EventCardProps) {
  const initials = event.createdBy.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(event);
        }
      }}
      className={cn(
        "bg-white rounded-lg p-4 shadow-sm border-l-4",
        "cursor-pointer hover:shadow-md transition-shadow"
      )}
      style={{
        borderLeftColor: event.category?.color ?? "#9ca3af",
      }}
    >
      {/* Title */}
      <h3 className="font-medium text-gray-900 line-clamp-1">{event.title}</h3>

      {/* Date/time */}
      <p className="mt-1 text-sm text-gray-500">{formatEventDate(event)}</p>

      {/* Bottom row */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Category badge */}
          {event.category && (
            <span
              className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: event.category.color }}
            >
              {event.category.name}
            </span>
          )}

          {/* Location */}
          {event.location && (
            <span className="flex items-center gap-1 text-xs text-gray-400 truncate min-w-0">
              <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>

        {/* Creator avatar */}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white"
          style={{ backgroundColor: event.createdBy.avatarColor }}
          title={event.createdBy.name}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

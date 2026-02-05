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
        "bg-[var(--color-bg-card)] rounded-2xl p-4 border border-[var(--color-border)]",
        "cursor-pointer transition-all hover:shadow-lg hover:border-[var(--color-primary)]/30",
        "hover:translate-y-[-2px]"
      )}
    >
      {/* Header with category color bar */}
      <div
        className="h-1 w-12 rounded-full mb-3"
        style={{ backgroundColor: event.category?.color ?? "#0D9488" }}
      />

      {/* Title */}
      <h3 className="font-semibold text-[var(--color-text)] line-clamp-1 mb-1">
        {event.title}
      </h3>

      {/* Date/time */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-3">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {formatEventDate(event)}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-light)]">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {/* Category badge */}
          {event.category && (
            <span
              className="inline-flex shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: event.category.color }}
            >
              {event.category.name}
            </span>
          )}

          {/* Location */}
          {event.location && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] truncate min-w-0">
              <svg
                className="h-3.5 w-3.5 shrink-0"
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
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
          style={{ backgroundColor: event.createdBy.avatarColor }}
          title={event.createdBy.name}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

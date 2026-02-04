"use client";

import { cn } from "@/lib/utils";
import { EventCard } from "./EventCard";

interface EventListEvent {
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

interface EventListProps {
  events: EventListEvent[];
  onEventClick?: (event: EventListEvent) => void;
}

export function EventList({ events, onEventClick }: EventListProps) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="h-16 w-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        <p className="text-sm font-medium">Событий не найдено</p>
        <p className="text-xs mt-1">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 overflow-y-auto",
        "max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-240px)]"
      )}
    >
      {sorted.map((event) => (
        <EventCard key={event.id} event={event} onClick={onEventClick} />
      ))}
    </div>
  );
}

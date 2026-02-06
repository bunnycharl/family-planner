"use client";

import dynamic from "next/dynamic";

const CalendarView = dynamic(
  () => import("@/components/calendar/CalendarView").then((mod) => mod.CalendarView),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    ),
  }
);

export default function CalendarPage() {
  return <CalendarView />;
}

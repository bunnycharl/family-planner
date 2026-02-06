"use client";

import dynamic from "next/dynamic";

const TimelineView = dynamic(
  () => import("@/components/timeline/TimelineView").then((mod) => mod.TimelineView),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    ),
  }
);

export default function TimelinePage() {
  return <TimelineView />;
}

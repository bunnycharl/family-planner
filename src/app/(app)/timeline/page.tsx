"use client";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import dynamic from "next/dynamic";

const TimelineView = dynamic(
  () => import("@/components/timeline/TimelineView").then((mod) => mod.TimelineView),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    ),
  }
);

export default function TimelinePage() {
  return (
    <ErrorBoundary featureName="Таймлайн">
      <TimelineView />
    </ErrorBoundary>
  );
}

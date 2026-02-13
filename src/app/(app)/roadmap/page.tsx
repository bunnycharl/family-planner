"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const RoadmapView = dynamic(
  () => import("@/components/roadmap/RoadmapView").then((mod) => mod.RoadmapView),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    ),
  }
);

export default function RoadmapPage() {
  return (
    <ErrorBoundary featureName="Роадмап">
      <div className="p-4 md:p-8 space-y-6">
        <RoadmapView />
      </div>
    </ErrorBoundary>
  );
}

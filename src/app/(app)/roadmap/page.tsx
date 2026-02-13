"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { RoadmapView } from "@/components/roadmap/RoadmapView";

export default function RoadmapPage() {
  return (
    <ErrorBoundary featureName="Роадмап">
      <div className="p-4 md:p-8 space-y-6">
        <RoadmapView />
      </div>
    </ErrorBoundary>
  );
}

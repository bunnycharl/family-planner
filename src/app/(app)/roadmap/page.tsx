"use client";

import { RoadmapView } from "@/components/roadmap/RoadmapView";

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
        Роадмап
      </h1>
      <RoadmapView />
    </div>
  );
}

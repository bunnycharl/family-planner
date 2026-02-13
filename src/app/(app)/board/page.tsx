"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const KanbanBoard = dynamic(
  () => import("@/components/board/KanbanBoard").then((mod) => mod.KanbanBoard),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--c-gray)] border-t-[var(--c-lavender)]" />
      </div>
    ),
  }
);

export default function BoardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
        <span className="bg-[var(--c-yellow)] px-4 py-1 rounded-xl inline-block">Канбан</span>
      </h1>
      <ErrorBoundary featureName="Канбан">
        <KanbanBoard />
      </ErrorBoundary>
    </div>
  );
}

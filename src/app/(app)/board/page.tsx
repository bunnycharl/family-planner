"use client";

import dynamic from "next/dynamic";

const KanbanBoard = dynamic(
  () => import("@/components/board/KanbanBoard").then((mod) => mod.KanbanBoard),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    ),
  }
);

export default function BoardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Канбан</h1>
      <KanbanBoard />
    </div>
  );
}

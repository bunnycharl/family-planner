"use client";

import { KanbanBoard } from "@/components/board/KanbanBoard";

export default function BoardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Канбан</h1>
      <KanbanBoard />
    </div>
  );
}

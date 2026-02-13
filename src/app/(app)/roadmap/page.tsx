"use client";

import { RoadmapView } from "@/components/roadmap/RoadmapView";

// Тестовый деплой: проверка работоспособности CI/CD после смены пароля VPS
export default function RoadmapPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <RoadmapView />
    </div>
  );
}

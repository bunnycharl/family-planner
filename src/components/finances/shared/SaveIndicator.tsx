"use client";

import { cn } from "@/lib/utils";

interface SaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
        status === "saving" && "bg-[var(--c-gray)] text-[var(--c-black)]/60",
        status === "saved" && "bg-[var(--c-success)]/10 text-[var(--c-success)]",
        status === "error" && "bg-[var(--c-error)]/10 text-[var(--c-error)]"
      )}
    >
      {status === "saving" && (
        <>
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--c-black)]/20 border-t-[var(--c-black)]/60" />
          <span>Сохранение...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <span>✓</span>
          <span>Сохранено</span>
        </>
      )}
      {status === "error" && (
        <>
          <span>✕</span>
          <span>Ошибка сохранения</span>
        </>
      )}
    </div>
  );
}

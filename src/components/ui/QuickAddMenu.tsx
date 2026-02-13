"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type QuickAddOption = "event" | "task";

interface QuickAddMenuProps {
  options?: QuickAddOption[];
  onSelect: (type: QuickAddOption) => void;
}

const OPTION_CONFIG: Record<QuickAddOption, { label: string }> = {
  event: { label: "Событие" },
  task: { label: "Задача" },
};

export function QuickAddMenu({ options = ["event", "task"], onSelect }: QuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={menuRef} className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40">
      {/* Popup menu */}
      {open && (
        <div className="absolute bottom-16 right-0 mb-2 w-48 rounded-3xl bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {options.map((opt) => {
            const cfg = OPTION_CONFIG[opt];
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSelect(opt);
                }}
                className="flex w-full items-center gap-3 px-5 py-4 text-sm font-bold uppercase text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-colors cursor-pointer"
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}

      {/* FAB button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-[var(--c-black)] text-white shadow-lg",
          "hover:scale-105 active:scale-95 transition-all cursor-pointer",
          open && "rotate-45"
        )}
        aria-label="Добавить"
      >
        <svg
          className="h-7 w-7 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}

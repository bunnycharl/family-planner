"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export type QuickAddOption = "event" | "task";

interface QuickAddMenuProps {
  options?: QuickAddOption[];
  onSelect: (type: QuickAddOption) => void;
}

const OPTION_CONFIG: Record<
  QuickAddOption,
  { label: string; icon: React.ReactNode; color: string }
> = {
  event: {
    label: "Событие",
    color: "text-[var(--color-primary)]",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
      </svg>
    ),
  },
  task: {
    label: "Задача",
    color: "text-[var(--color-success)]",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export function QuickAddMenu({ options = ["event", "task"], onSelect }: QuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  // Close on Escape
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
        <div className="absolute bottom-16 right-0 mb-2 w-48 rounded-xl bg-[var(--color-bg-card)] shadow-xl border border-[var(--color-border)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
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
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-border-light)] transition-colors"
              >
                <span className={cfg.color}>{cfg.icon}</span>
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
          "bg-[var(--color-primary)] text-white shadow-lg",
          "hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all",
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

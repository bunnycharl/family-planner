"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  subtitle?: string;
  color?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({
  title,
  subtitle,
  color,
  defaultOpen = true,
  children,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl bg-[var(--c-gray)] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 md:px-6 md:py-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {color && (
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          )}
          <span className="text-sm font-extrabold uppercase tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {subtitle && (
            <span className="text-sm font-bold text-[var(--c-black)]/60">{subtitle}</span>
          )}
          <span className={cn("text-xs transition-transform duration-200", isOpen && "rotate-180")}>
            ▼
          </span>
        </div>
      </button>
      {isOpen && <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-3">{children}</div>}
    </div>
  );
}

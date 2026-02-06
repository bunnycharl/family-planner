"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const avatarColor = session?.user?.avatarColor || "#0D9488";

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/95 backdrop-blur-sm px-4 md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="text-base font-bold text-[var(--color-primary)]">Family Planner</span>
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2 shadow-lg">
            {session?.user?.name && (
              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {session.user.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {session.user.email || "Пользователь"}
                </p>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium cursor-pointer",
                "text-[var(--color-error)] hover:bg-[var(--color-border-light)] transition-colors"
              )}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

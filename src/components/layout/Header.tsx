"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

  const avatarColor = session?.user?.avatarColor || "#FF6B6B";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-white px-4 md:hidden">
      {/* Brand — sticker style */}
      <div className="flex items-center gap-1">
        <span className="bg-[var(--c-black)] text-white px-3 py-1 rounded-lg text-sm font-extrabold uppercase">
          Family
        </span>
        <span className="bg-[var(--c-black)] text-white px-3 py-1 rounded-lg text-sm font-extrabold uppercase">
          Planner
        </span>
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition-transform active:scale-95 cursor-pointer"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 z-50 w-52 rounded-3xl bg-white py-2 shadow-xl">
            {session?.user?.name && (
              <div className="px-4 py-3 border-b border-[var(--c-gray)]">
                <p className="text-sm font-bold uppercase text-[var(--c-black)]">
                  {session.user.name}
                </p>
                <p className="text-xs text-[#999]">{session.user.email || "Пользователь"}</p>
              </div>
            )}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold uppercase cursor-pointer",
                "text-[var(--c-black)] hover:bg-[var(--c-gray)] transition-colors"
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Настройки
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold uppercase cursor-pointer",
                "text-[var(--c-coral)] hover:bg-[var(--c-gray)] transition-colors"
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

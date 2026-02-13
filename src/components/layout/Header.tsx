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

  const avatarColor = session?.user?.avatarColor || "#FF6B6B";

  return (
    <header className="flex h-14 items-center justify-between bg-white px-4 md:hidden">
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

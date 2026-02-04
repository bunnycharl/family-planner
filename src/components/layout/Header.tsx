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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const avatarColor = session?.user?.avatarColor || "#6366f1";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
      <span className="text-lg font-bold text-indigo-600">Family Planner</span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border bg-white py-1 shadow-lg">
            {session?.user?.name && (
              <div className="border-b px-4 py-2 text-sm font-medium text-gray-700">
                {session.user.name}
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="flex w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

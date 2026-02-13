"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Календарь", href: "/calendar" },
  { label: "Таймлайн", href: "/timeline" },
  { label: "Роадмап", href: "/roadmap" },
  { label: "Канбан", href: "/board" },
  { label: "События", href: "/events" },
  { label: "Финансы", href: "/finances" },
];

const settingsItem = { label: "Настройки", href: "/settings" };

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
    <aside className="hidden w-60 shrink-0 flex-col bg-white md:flex">
      {/* Brand — sticker style */}
      <div className="p-6 pb-8">
        <div className="flex flex-col items-start gap-1">
          <span className="bg-[var(--c-black)] text-white px-4 py-2 rounded-xl text-2xl font-extrabold uppercase">
            Family
          </span>
          <span className="bg-[var(--c-black)] text-white px-4 py-2 rounded-xl text-2xl font-extrabold uppercase">
            Planner
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-3 px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center rounded-full px-5 py-4 font-bold text-base uppercase transition-all cursor-pointer",
                isActive
                  ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
                  : "text-[var(--c-black)] hover:bg-[var(--c-gray)] hover:translate-x-2"
              )}
            >
              <span>{item.label}</span>
              {isActive && <span className="absolute right-5 text-[10px]">●</span>}
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Settings */}
        <Link
          href={settingsItem.href}
          className={cn(
            "relative flex items-center rounded-full px-5 py-4 font-bold text-base uppercase transition-all cursor-pointer",
            pathname.startsWith(settingsItem.href)
              ? "bg-[var(--c-yellow)] text-[var(--c-black)]"
              : "text-[var(--c-black)] hover:bg-[var(--c-gray)] hover:translate-x-2"
          )}
        >
          <span>{settingsItem.label}</span>
          {pathname.startsWith(settingsItem.href) && (
            <span className="absolute right-5 text-[10px]">●</span>
          )}
        </Link>

        {/* User profile */}
        <div className="py-4">
          <div className="flex items-center gap-3 rounded-full px-4 py-3">
            {status === "loading" ? (
              <>
                <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--c-gray)] animate-pulse" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-20 rounded-full bg-[var(--c-gray)] animate-pulse" />
                  <div className="h-3 w-28 rounded-full bg-[var(--c-gray)] animate-pulse" />
                </div>
              </>
            ) : session?.user ? (
              <>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white border-3 border-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold uppercase text-[var(--c-black)]">
                    {session.user.name}
                  </p>
                  <p className="truncate text-xs text-[#666]">{session.user.email || ""}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="shrink-0 rounded-full p-2 text-[#999] hover:text-[var(--c-error)] hover:bg-[var(--c-coral)]/10 transition-all cursor-pointer"
                  title="Выйти"
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
                </button>
              </>
            ) : null}
          </div>
        </div>
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Календарь",
    href: "/calendar",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
      </svg>
    ),
  },
  {
    label: "Таймлайн",
    href: "/timeline",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
      </svg>
    ),
  },
  {
    label: "Канбан",
    href: "/board",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="5" height="15" rx="1" />
      </svg>
    ),
  },
  {
    label: "События",
    href: "/events",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="5" cy="6" r="1.5" fill="currentColor" />
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="5" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

const settingsItem = {
  label: "Настройки",
  href: "/settings",
  icon: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-card)] md:flex">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] shadow-sm">
            <svg
              width="22"
              height="22"
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
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text)]">Family Planner</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Планирование семьи</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Меню
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white/50" />}
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Settings */}
        <div className="border-t border-[var(--color-border)] pt-3">
          <Link
            href={settingsItem.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all cursor-pointer",
              pathname.startsWith(settingsItem.href)
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)]"
            )}
          >
            {settingsItem.icon}
            <span>{settingsItem.label}</span>
          </Link>
        </div>

        {/* User profile */}
        {session?.user && (
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {session.user.name}
                </p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">
                  {session.user.email || ""}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="shrink-0 rounded-lg p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all cursor-pointer"
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
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

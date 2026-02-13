"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FINANCE_TABS = [
  { href: "/finances", label: "Обзор", color: "var(--c-mint)", exact: true },
  { href: "/finances/transactions", label: "Расходы", color: "var(--c-coral)", exact: false },
  { href: "/finances/planning", label: "Планирование", color: "var(--c-lavender)", exact: false },
  { href: "/finances/settings", label: "Настройки", color: "var(--c-black)", exact: false },
];

export default function FinancesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="sticky top-0 z-20 -mx-4 -mt-4 bg-[var(--c-white)] px-4 pt-4 pb-4 md:-mx-8 md:-mt-8 md:px-8 md:pt-8 space-y-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[var(--c-black)]">
          <span className="bg-[var(--c-coral)] px-4 py-1 rounded-xl inline-block text-white">
            Финансы
          </span>
        </h1>
        <nav className="flex flex-wrap gap-2">
          {FINANCE_TABS.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-bold uppercase transition-all",
                  isActive
                    ? "text-white"
                    : "border-2 border-[var(--c-black)] bg-[var(--c-white)] text-[var(--c-black)] hover:opacity-80"
                )}
                style={isActive ? { backgroundColor: tab.color } : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}

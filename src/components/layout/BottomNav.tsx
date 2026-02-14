"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Календарь", href: "/calendar" },
  { label: "Таймлайн", href: "/timeline" },
  { label: "Роадмап", href: "/roadmap" },
  { label: "Канбан", href: "/board" },
  { label: "Финансы", href: "/finances" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-all cursor-pointer",
                isActive ? "text-[var(--c-black)]" : "text-[#999] active:text-[var(--c-black)]"
              )}
            >
              <div
                className={cn(
                  "flex h-8 items-center justify-center rounded-full px-4 transition-all",
                  isActive && "bg-[var(--c-yellow)]"
                )}
              >
                <span
                  className={cn("text-[9px] font-bold uppercase", isActive && "font-extrabold")}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

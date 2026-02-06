"use client";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </SessionProvider>
  );
}

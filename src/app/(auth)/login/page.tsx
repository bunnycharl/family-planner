"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: login,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный логин или пароль");
      } else {
        router.push("/calendar");
      }
    } catch {
      setError("Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-xl border border-[var(--color-border)] p-8">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] shadow-lg">
              <svg
                width="32"
                height="32"
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
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Family Planner
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Войдите в свой аккаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm rounded-xl p-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-[var(--color-text)] mb-2"
            >
              Логин
            </label>
            <input
              id="login"
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              autoComplete="username"
              className={cn(
                "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3",
                "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
                "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10",
                "outline-none transition-all"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-text)] mb-2"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              className={cn(
                "w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3",
                "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
                "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10",
                "outline-none transition-all"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-[var(--color-primary)] text-white font-semibold rounded-xl px-4 py-3.5",
              "hover:bg-[var(--color-primary-dark)] active:scale-[0.98]",
              "focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none",
              "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2 cursor-pointer"
            )}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
        Семейный планировщик для организации событий и задач
      </p>
    </div>
  );
}

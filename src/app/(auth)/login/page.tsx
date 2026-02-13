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
      <div className="bg-[var(--c-gray)] rounded-3xl p-8">
        {/* Logo and title — sticker style */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-4">
            <span className="bg-[var(--c-black)] text-white rounded-xl px-4 py-2 text-2xl font-extrabold uppercase">
              Family
            </span>
            <span className="bg-[var(--c-black)] text-white rounded-xl px-4 py-2 text-2xl font-extrabold uppercase">
              Planner
            </span>
          </div>
          <p className="text-sm font-bold uppercase text-[#999] tracking-wide">
            Войдите в свой аккаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-[var(--c-coral)]/10 text-[var(--c-coral)] text-sm font-bold rounded-full px-5 py-3">
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
              className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-2"
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
                "w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-3",
                "text-[var(--c-black)] placeholder:text-[#bbb] font-medium",
                "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]",
                "transition-all"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wide text-[#999] mb-2"
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
                "w-full rounded-2xl border-2 border-[var(--c-black)] bg-white px-4 py-3",
                "text-[var(--c-black)] placeholder:text-[#bbb] font-medium",
                "focus:outline-none focus:ring-2 focus:ring-[var(--c-black)]/20 focus:border-[var(--c-black)]",
                "transition-all"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-[var(--c-black)] text-white font-bold uppercase rounded-full px-4 py-4",
              "hover:opacity-90 active:scale-[0.98]",
              "focus:ring-4 focus:ring-[var(--c-black)]/20 focus:outline-none",
              "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
            )}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
      <p className="text-center text-xs font-bold uppercase text-[#999] mt-6 tracking-wide">
        Семейный планировщик для организации событий и задач
      </p>
    </div>
  );
}

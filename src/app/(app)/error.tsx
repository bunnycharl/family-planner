"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--c-coral)]">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold uppercase text-[var(--c-black)]">Произошла ошибка</h2>
        <p className="mb-6 text-sm text-[#666]">
          Не удалось загрузить страницу. Попробуйте ещё раз.
        </p>
        {error.digest && <p className="mb-4 text-xs text-[#999]">Код: {error.digest}</p>}
        <button
          onClick={reset}
          className="rounded-full bg-[var(--c-black)] px-6 py-3 text-sm font-bold uppercase text-white transition-all hover:opacity-80 cursor-pointer"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

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
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/10">
          <svg
            className="h-8 w-8 text-[var(--color-error)]"
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
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Произошла ошибка</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          Не удалось загрузить страницу. Попробуйте ещё раз.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">Код: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] cursor-pointer"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

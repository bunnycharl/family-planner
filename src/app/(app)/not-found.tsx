import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl font-bold text-[var(--color-text-muted)]">404</div>
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text)]">Страница не найдена</h2>
        <p className="mb-6 text-[var(--color-text-secondary)]">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link
          href="/calendar"
          className="inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Вернуться к календарю
        </Link>
      </div>
    </div>
  );
}

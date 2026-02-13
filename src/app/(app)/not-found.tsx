import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl font-extrabold uppercase text-[var(--c-black)]">404</div>
        <h2 className="mb-2 text-xl font-bold uppercase text-[var(--c-black)]">
          Страница не найдена
        </h2>
        <p className="mb-6 text-sm text-[#999]">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link
          href="/calendar"
          className="inline-block rounded-full bg-[var(--c-black)] px-6 py-3 text-sm font-bold uppercase text-white transition-all hover:opacity-80"
        >
          Вернуться к календарю
        </Link>
      </div>
    </div>
  );
}

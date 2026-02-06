"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <head>
        <style>{`
          :root {
            --ge-bg: #F8FAFC;
            --ge-text: #134E4A;
            --ge-text-secondary: #5F7572;
            --ge-text-muted: #94A3B8;
            --ge-primary: #0D9488;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --ge-bg: #0F1419;
              --ge-text: #E7ECEA;
              --ge-text-secondary: #94A3B8;
              --ge-text-muted: #64748B;
              --ge-primary: #14B8A6;
            }
          }
        `}</style>
      </head>
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--ge-bg)",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--ge-text)",
              marginBottom: "0.5rem",
            }}
          >
            Что-то пошло не так
          </h1>
          <p
            style={{
              color: "var(--ge-text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            Произошла непредвиденная ошибка. Попробуйте обновить страницу.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--ge-text-muted)",
                marginBottom: "1rem",
              }}
            >
              Код ошибки: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "var(--ge-primary)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}

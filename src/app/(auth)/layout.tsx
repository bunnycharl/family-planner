export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Background decoration — colorful circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--c-coral)] opacity-20" />
        <div className="absolute top-1/3 -left-16 w-48 h-48 rounded-full bg-[var(--c-mint)] opacity-20" />
        <div className="absolute -bottom-16 right-1/4 w-56 h-56 rounded-full bg-[var(--c-yellow)] opacity-20" />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-[var(--c-lavender)] opacity-15" />
      </div>
      {children}
    </div>
  );
}

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0 min-w-0">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

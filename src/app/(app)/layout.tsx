import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Platform admins are redirected to their dedicated panel
  if (session?.user?.isAdmin) {
    redirect("/admin");
  }
  return <AppShell>{children}</AppShell>;
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminContent } from "./AdminContent";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/calendar");
  }
  return <AdminContent />;
}

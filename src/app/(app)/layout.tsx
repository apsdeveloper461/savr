import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopBar } from "@/components/navigation/topbar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const sessionUser = {
    name: user.name,
    email: user.email,
  };

  return (
    <div className="grid min-h-screen gap-0 bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100 lg:grid-cols-[280px_1fr]">
      <Sidebar user={sessionUser} />
      <div className="flex flex-col">
        <TopBar user={sessionUser} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

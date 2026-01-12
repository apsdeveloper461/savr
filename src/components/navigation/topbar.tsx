"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "Log income", href: "/transactions?panel=income" },
  { label: "Log expense", href: "/transactions?panel=expense" },
  { label: "New goal", href: "/goals?panel=create" },
];

type TopBarUser = {
  name?: string | null;
};

export const TopBar = ({ user }: { user: TopBarUser }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white/70 px-4 py-4 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {(() => {
            switch (pathname) {
              case "/dashboard":
                return "Overview";
              case "/transactions":
                return "Transactions";
              case "/accounts":
                return "Accounts";
              case "/goals":
                return "Saving goals";
              case "/reports":
                return "Insights & reports";
              case "/notifications":
                return "Alerts";
              default:
                return "Savr";
            }
          })()}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.name ? `You've got this, ${user.name.split(" ")[0]}!` : "Let's make every dollar count."}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
            )}
          >
            {action.label}
          </Link>
        ))}
        <Button variant="ghost" onClick={handleLogout} isLoading={isLoggingOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
};

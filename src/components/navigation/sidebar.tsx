"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Wallet, PiggyBank, BarChart3, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: TrendingUp },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Saving Goals", href: "/goals", icon: PiggyBank },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: BellRing },
];

type SidebarUser = {
  name?: string | null;
  email: string;
};

export const Sidebar = ({ user }: { user: SidebarUser }) => {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen flex-col justify-between border-r border-zinc-200 bg-white px-5 py-8 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
      <div className="space-y-8">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-zinc-400">Welcome</div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name ?? "Money Maestro"}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-black text-white shadow-sm dark:bg-zinc-100 dark:text-black"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Monthly tip</p>
        <p className="mt-1 text-xs">
          Track bank balances weekly to stay ahead of spending and boost your saving streak.
        </p>
      </div>
    </aside>
  );
};

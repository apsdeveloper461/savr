"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Wallet, PiggyBank, BarChart3, BellRing, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { signOut } from "next-auth/react";

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 font-bold text-white dark:bg-white dark:text-black">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">Savr</span>
          </div>
          <ModeToggle />
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
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
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

      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Monthly tip</p>
          <p className="mt-1 text-xs">
            Track bank balances weekly to stay ahead of spending and boost your saving streak.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="font-medium text-xs">{user.name?.[0] ?? "U"}</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name ?? "User"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

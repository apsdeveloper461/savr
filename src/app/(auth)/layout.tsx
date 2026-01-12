import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-100 via-white to-zinc-100 dark:from-black dark:via-zinc-900 dark:to-black">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/80 p-10 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mb-8 space-y-2 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-semibold text-white dark:bg-zinc-100 dark:text-black">
            S
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Savr</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Your intelligent money companion</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

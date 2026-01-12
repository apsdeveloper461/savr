"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: React.ReactNode;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", className)}>
        {icon && <span className="pointer-events-none absolute left-3 text-zinc-400">{icon}</span>}
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
            icon ? "pl-9" : "",
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 text-xs text-zinc-400">▾</span>
      </div>
    );
  },
);

Select.displayName = "Select";

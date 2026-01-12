"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  prefix?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", prefix, ...props }, ref) => {
    return (
      <div className={cn("flex items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800", className)}>
        {prefix && (
          <span className="px-3 text-sm text-zinc-500">{prefix}</span>
        )}
        <input
          ref={ref}
          type={type}
          className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-black outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

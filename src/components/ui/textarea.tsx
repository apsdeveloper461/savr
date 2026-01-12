"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
  "min-h-30 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition focus:outline-none focus:ring-2 focus:ring-black/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

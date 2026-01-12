"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Progress = ({
  className,
  value = 0,
}: {
  className?: string;
  value?: number;
}) => {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
    >
      <div
        className="h-2 rounded-full bg-black transition-all dark:bg-zinc-100"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

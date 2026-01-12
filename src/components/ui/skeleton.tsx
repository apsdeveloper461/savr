import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80",
      className,
    )}
  />
);

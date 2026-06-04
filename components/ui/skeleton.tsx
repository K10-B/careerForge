import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-sky-50 via-sky-100 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
        className,
      )}
      {...props}
    />
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ResumesLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-9 w-24 rounded-full" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-80 max-w-full" />
          </div>
          <Skeleton className="h-11 w-36 rounded-2xl" />
        </div>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-sky-100 bg-white/75 p-6 shadow-[0_18px_60px_rgba(14,165,233,0.08)] dark:border-border/70 dark:bg-card/70">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-6 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-8 flex gap-2">
              <Skeleton className="h-11 w-32 rounded-2xl" />
              <Skeleton className="h-11 w-32 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

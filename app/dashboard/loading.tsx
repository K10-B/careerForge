import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-sky-100 bg-white/70 p-8 shadow-[0_20px_70px_rgba(14,165,233,0.08)] backdrop-blur-xl dark:border-border/70 dark:bg-card/70">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[28px]" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-[360px] rounded-[28px]" />
        <div className="space-y-6">
          <Skeleton className="h-52 rounded-[28px]" />
          <Skeleton className="h-64 rounded-[28px]" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-64 rounded-[28px]" />
        <Skeleton className="h-64 rounded-[28px]" />
      </section>
    </div>
  );
}

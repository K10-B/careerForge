import { Skeleton } from "@/components/ui/skeleton";

export default function NewResumeLoading() {
  return <ResumeEditorSkeleton />;
}

function ResumeEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-9 w-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-72 max-w-full" />
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(620px,1.15fr)_minmax(460px,0.85fr)]">
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[28px]" />
          <div className="rounded-[28px] border border-sky-100 bg-white/75 p-6 dark:border-white/6 dark:bg-white/[0.025]">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-4 w-72" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className={index === 0 || index === 7 ? "h-10 rounded-xl md:col-span-2" : "h-10 rounded-xl"} />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-[720px] rounded-[28px]" />
      </div>
    </div>
  );
}

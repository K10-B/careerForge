import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeEditLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-9 w-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-96 max-w-full" />
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(620px,1.15fr)_minmax(460px,0.85fr)]">
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[28px]" />
          <Skeleton className="h-[720px] rounded-[28px]" />
        </div>
        <Skeleton className="h-[760px] rounded-[28px]" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function CoverLettersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-9 w-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-80 max-w-full" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="h-[620px] rounded-[28px]" />
        <Skeleton className="h-[620px] rounded-[28px]" />
      </div>
    </div>
  );
}

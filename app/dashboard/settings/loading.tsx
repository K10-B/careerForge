import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-9 w-24 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-72 max-w-full" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[420px] rounded-[28px]" />
        <Skeleton className="h-[420px] rounded-[28px]" />
      </div>
    </div>
  );
}

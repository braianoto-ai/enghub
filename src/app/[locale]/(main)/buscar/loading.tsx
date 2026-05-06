import { Skeleton } from "@/components/ui/skeleton";

export default function BuscarLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Search bar */}
      <div className="mb-8 flex gap-3">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-1 h-3 w-5/6" />
            <div className="mt-3 flex gap-1.5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 dark:border-slate-800">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

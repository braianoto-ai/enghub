import { Skeleton } from "@/components/ui/skeleton";

export default function AvaliacoesLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-4 w-56" />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <Skeleton className="mx-auto h-10 w-16" />
            <Skeleton className="mx-auto mt-3 h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 dark:border-zinc-800">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

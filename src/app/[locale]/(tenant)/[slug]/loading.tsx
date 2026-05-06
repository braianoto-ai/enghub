import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <div className="h-12 border-b border-white/10 bg-zinc-950/80" />

      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/50 px-4 pb-16 pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Skeleton className="h-24 w-24 rounded-2xl shrink-0 bg-white/10" />
            <div className="space-y-3 text-center sm:text-left">
              <Skeleton className="h-8 w-64 bg-white/10" />
              <div className="flex gap-2 justify-center sm:justify-start">
                <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-4 w-36 bg-white/10" />
            </div>
          </div>
          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-3 rounded-2xl border border-white/10 bg-white/5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-4 text-center">
                <Skeleton className="mx-auto mb-2 h-6 w-10 bg-white/10" />
                <Skeleton className="mx-auto h-3 w-16 bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="space-y-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="flex flex-wrap gap-2 pt-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Bio */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Projects */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <Skeleton className="h-36 w-full rounded-none" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
              <Skeleton className="mb-4 h-5 w-20" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-20 ml-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

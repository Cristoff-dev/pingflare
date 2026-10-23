export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="h-9 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse mt-3" />
        </div>
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
      </header>

      <div className="space-y-6">
        <div className="h-11 w-full max-w-md bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col p-5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 h-[260px] shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-900">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-16 w-full bg-neutral-100 dark:bg-neutral-900/50 rounded-t-sm mt-4 animate-pulse flex items-end gap-[2px]">
                {[...Array(15)].map((_, j) => (
                  <div key={j} className="flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
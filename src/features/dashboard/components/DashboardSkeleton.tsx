interface DashboardSkeletonProps {
  statCount?: number;
  hasCharts?: boolean;
  hasCalendar?: boolean;
}

export default function DashboardSkeleton({
  statCount = 5,
  hasCharts = true,
  hasCalendar = true,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 rounded-lg bg-gray-200 dark:bg-slate-800" />
        <div className="h-4 w-96 max-w-full rounded-md bg-gray-100 dark:bg-slate-800/60" />
      </div>

      {/* Stat Cards Skeleton */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${statCount} gap-3.5 sm:gap-4`}
        style={{
          gridTemplateColumns: `repeat(${statCount}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: statCount }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-4 rounded-full bg-gray-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-12 rounded bg-gray-300 dark:bg-slate-700 mb-2" />
            <div className="h-2.5 w-28 rounded bg-gray-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      {hasCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 h-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="h-4 w-36 rounded bg-gray-200 dark:bg-slate-800 mb-6" />
            <div className="h-48 w-full rounded-xl bg-gray-100 dark:bg-slate-800/40" />
          </div>
          <div className="lg:col-span-5 h-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-slate-800 mb-6" />
            <div className="h-48 w-full rounded-full mx-auto max-w-[190px] border-8 border-gray-100 dark:border-slate-800/50" />
          </div>
        </div>
      )}

      {/* Calendar & Reminder Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {hasCalendar ? (
          <>
            <div className="lg:col-span-7 h-80 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="h-4 w-36 rounded bg-gray-200 dark:bg-slate-800 mb-6" />
              <div className="h-56 w-full rounded-xl bg-gray-100 dark:bg-slate-800/40" />
            </div>
            <div className="lg:col-span-5 h-80 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-slate-800 mb-6" />
              <div className="space-y-3">
                <div className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800/40" />
                <div className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800/40" />
                <div className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800/40" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-64 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-slate-800 mb-6" />
            <div className="space-y-3">
              <div className="h-14 rounded-xl bg-gray-100 dark:bg-slate-800/40" />
              <div className="h-14 rounded-xl bg-gray-100 dark:bg-slate-800/40" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

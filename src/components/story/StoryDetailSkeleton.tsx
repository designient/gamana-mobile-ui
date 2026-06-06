export default function StoryDetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="h-60 bg-gamana-50 dark:bg-gamana-900/20 animate-pulse" />

      <div className="px-4 -mt-6 relative z-10">
        <div className="h-5 w-48 bg-gamana-100 rounded animate-pulse mb-2" />
        <div className="h-4 w-32 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
      </div>

      <div className="px-4 mt-6">
        <div className="flex justify-around py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gamana-50 dark:bg-gamana-900/20 animate-pulse" />
              <div className="w-10 h-3 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="h-4 w-24 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="h-4 w-28 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gamana-50 dark:bg-gamana-900/20 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gamana-50 dark:bg-gamana-900/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

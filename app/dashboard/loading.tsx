// Instant navigation feedback. App Router shows this skeleton the moment a
// dashboard section is clicked, while the server streams the real page — so
// nav feels immediate instead of hanging on the previous page.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-black/[0.06] ${className}`} />;
}

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-panel p-5 ${className}`}>
      <Bar className="h-3 w-24" />
      <Bar className="mt-4 h-8 w-32" />
      <Bar className="mt-3 h-3 w-full" />
      <Bar className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* sidebar placeholder */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-panel p-5 lg:block">
        <div className="flex items-center gap-3">
          <Bar className="h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <Bar className="h-3 w-20" />
            <Bar className="mt-1.5 h-2 w-28" />
          </div>
        </div>
        <Bar className="mt-6 h-16 w-full rounded-xl" />
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bar key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>
      </aside>

      {/* content placeholder */}
      <main className="flex-1 p-5 sm:p-8">
        <Bar className="h-6 w-56" />
        <Bar className="mt-2 h-3 w-80 max-w-full" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton className="mt-6 h-48" />
      </main>
    </div>
  );
}

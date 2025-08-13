export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border">
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse mb-2" />
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
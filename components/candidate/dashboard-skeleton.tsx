export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <div className="h-6 bg-muted rounded w-1/4 animate-pulse mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-3/4 animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-6 bg-muted rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
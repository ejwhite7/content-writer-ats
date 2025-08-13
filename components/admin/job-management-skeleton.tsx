export function JobManagementSkeleton() {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6 border-b">
        <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
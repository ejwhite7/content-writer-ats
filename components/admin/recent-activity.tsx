export function RecentActivity() {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <div className="flex-1">
            <p className="text-sm">New application for Frontend Developer</p>
            <p className="text-xs text-muted-foreground">2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <div className="flex-1">
            <p className="text-sm">Interview scheduled for Backend Engineer</p>
            <p className="text-xs text-muted-foreground">1 hour ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <div className="flex-1">
            <p className="text-sm">Job posting published: DevOps Engineer</p>
            <p className="text-xs text-muted-foreground">3 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Jobs</h3>
          <div className="text-2xl font-bold">42</div>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Applications</h3>
          <div className="text-2xl font-bold">128</div>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Interviews</h3>
          <div className="text-2xl font-bold">24</div>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Hired</h3>
          <div className="text-2xl font-bold">8</div>
        </div>
      </div>
    </div>
  )
}
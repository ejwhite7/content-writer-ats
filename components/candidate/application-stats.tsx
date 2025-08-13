export function ApplicationStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-muted-foreground">Total Applications</h3>
        <div className="text-2xl font-bold">12</div>
        <p className="text-xs text-muted-foreground">+3 this week</p>
      </div>
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-muted-foreground">Interviews</h3>
        <div className="text-2xl font-bold">4</div>
        <p className="text-xs text-muted-foreground">2 upcoming</p>
      </div>
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-sm font-medium text-muted-foreground">Response Rate</h3>
        <div className="text-2xl font-bold">67%</div>
        <p className="text-xs text-muted-foreground">Above average</p>
      </div>
    </div>
  )
}
export function CandidateDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Frontend Developer</h4>
              <p className="text-sm text-muted-foreground">Tech Corp Inc.</p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Under Review</span>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">React Developer</h4>
              <p className="text-sm text-muted-foreground">StartupXYZ</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Interview Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  )
}
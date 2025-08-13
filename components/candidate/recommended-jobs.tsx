export function RecommendedJobs() {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Recommended for You</h3>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
          <h4 className="font-medium">Senior React Developer</h4>
          <p className="text-sm text-muted-foreground">TechCorp</p>
          <p className="text-sm text-green-600">95% match</p>
        </div>
        <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
          <h4 className="font-medium">Full Stack Engineer</h4>
          <p className="text-sm text-muted-foreground">Innovation Labs</p>
          <p className="text-sm text-green-600">88% match</p>
        </div>
        <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
          <h4 className="font-medium">Frontend Lead</h4>
          <p className="text-sm text-muted-foreground">Digital Agency</p>
          <p className="text-sm text-green-600">82% match</p>
        </div>
      </div>
    </div>
  )
}
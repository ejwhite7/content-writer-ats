export function CandidateHeader() {
  return (
    <header className="bg-background border-b h-16 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Candidate Dashboard</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">Welcome back!</span>
      </div>
    </header>
  )
}
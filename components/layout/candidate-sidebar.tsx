export function CandidateSidebar() {
  return (
    <div className="w-64 bg-card border-r h-screen">
      <div className="p-6">
        <h2 className="font-bold text-lg">My Dashboard</h2>
      </div>
      <nav className="px-4">
        <a href="/candidate/dashboard" className="block py-2 px-4 rounded hover:bg-muted">Dashboard</a>
        <a href="/candidate/applications" className="block py-2 px-4 rounded hover:bg-muted">Applications</a>
        <a href="/candidate/profile" className="block py-2 px-4 rounded hover:bg-muted">Profile</a>
      </nav>
    </div>
  )
}
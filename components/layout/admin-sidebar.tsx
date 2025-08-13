export function AdminSidebar() {
  return (
    <div className="w-64 bg-card border-r h-screen">
      <div className="p-6">
        <h2 className="font-bold text-lg">Admin Panel</h2>
      </div>
      <nav className="px-4">
        <a href="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-muted">Dashboard</a>
        <a href="/admin/jobs" className="block py-2 px-4 rounded hover:bg-muted">Jobs</a>
        <a href="/admin/candidates" className="block py-2 px-4 rounded hover:bg-muted">Candidates</a>
      </nav>
    </div>
  )
}
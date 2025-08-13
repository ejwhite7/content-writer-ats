interface JobApplicationFormProps {
  jobId: string
}

export function JobApplicationForm({ jobId }: JobApplicationFormProps) {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Apply for this position</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="form-input"
        />
        <input
          type="email"
          placeholder="Email"
          className="form-input"
        />
        <textarea
          placeholder="Cover Letter"
          rows={4}
          className="form-textarea"
        />
        <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Submit Application
        </button>
      </div>
    </div>
  )
}
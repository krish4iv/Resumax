import { Loader2, Briefcase } from 'lucide-react'

const STATUSES = ['applied', 'interview', 'offer', 'rejected']

const PipelineBoard = ({ loading, applications }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Loader2 size={26} className="animate-spin text-cyan-400" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Briefcase size={44} className="mx-auto text-slate-600 mb-3" />
        <p className="font-medium text-white">Nothing in your pipeline yet</p>
        <p className="text-slate-500 text-sm mt-1">
          Jobs you save from Browse or For You will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STATUSES.map(status => {
        const columnApps = applications.filter(a => a.status === status)
        return (
          <div key={status}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              {status} ({columnApps.length})
            </p>
            <div className="space-y-2">
              {columnApps.map(app => (
                <div key={app.id} className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                  <p className="text-sm font-medium text-white">{app.job_title}</p>
                  <p className="text-xs text-slate-500">{app.company}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PipelineBoard
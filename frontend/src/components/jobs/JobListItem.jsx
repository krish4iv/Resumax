import { ChevronRight, Building2, MapPin, Clock } from 'lucide-react'

const JobListItem = ({ job, isSelected, isForYou, onSelect }) => (
  <button
    onClick={() => onSelect(job.id)}
    className={`w-full text-left p-4 rounded-2xl border transition-all ${
      isSelected
        ? 'border-cyan-400/40 bg-cyan-400/[0.06]'
        : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12]'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 shrink-0 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
        <ChevronRight size={15} className="text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white leading-tight text-sm truncate">{job.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <Building2 size={11} />
          <span className="truncate">{job.company}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {job.location}
            </span>
          )}
          {job.posted_at && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {new Date(job.posted_at).toLocaleDateString()}
            </span>
          )}
          {!job.posted_at && !isForYou && <span>today</span>}
        </div>
      </div>
      {job.match_score != null && (
        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {Math.round(job.match_score)}%
        </span>
      )}
    </div>
  </button>
)

export default JobListItem
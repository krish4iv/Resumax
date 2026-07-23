import { ChevronRight, MapPin, Target, Bookmark, CheckCircle2, ExternalLink, Briefcase } from 'lucide-react'

const JobDetailPanel = ({ job, saving, savedIds, applying, appliedIds, onSave, onApply }) => {
  if (!job) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 lg:sticky lg:top-4 min-h-[420px] flex flex-col items-center justify-center h-full py-16 text-center">
        <Briefcase size={40} className="text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">Select a job to see the details</p>
      </div>
    )
  }

  const isSaved = savedIds.has(job.id)
  const isApplied = appliedIds.has(job.id)

  const handleApplyClick = () => {
    if (job.source_url) window.open(job.source_url, '_blank', 'noopener,noreferrer')
    onApply(job)
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 lg:sticky lg:top-4 min-h-[420px]">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
          <ChevronRight size={18} className="text-slate-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white leading-tight">{job.title}</h2>
          <p className="text-sm text-slate-400 mt-1">{job.company}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
            {job.location && (
              <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
            )}
            {job.posted_at && <span>{new Date(job.posted_at).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-5">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-semibold hover:bg-cyan-400 transition-all">
          <Target size={14} />
          Tailor for this
        </button>
        <button
          onClick={() => onSave(job)}
          disabled={saving || isSaved}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <Bookmark size={14} className={isSaved ? 'fill-current' : ''} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={handleApplyClick}
          disabled={applying || isApplied || !job.source_url}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          {isApplied ? 'Applied' : applying ? 'Applying…' : 'Apply'}
          {!isApplied && !applying && <ExternalLink size={12} />}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-3">About this role</p>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {job.description || 'No description provided for this listing.'}
        </p>
      </div>
    </div>
  )
}

export default JobDetailPanel
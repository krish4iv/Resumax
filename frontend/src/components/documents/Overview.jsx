// src/components/documents/OverviewTab.jsx
import { FileText, CheckCircle2, Trophy, Gauge, Plus, Loader2 } from "lucide-react"
import Glass from "./Glass.jsx"
import ScoreCard from "./ScoreCard.jsx"
import ErrorBanner from "./ErrorBanner.jsx"

function StatCard({ icon: Icon, label, value }) {
  return (
    <Glass className="p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
        <Icon size={16} className="text-cyan-200" />
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{label}</p>
    </Glass>
  )
}

export default function OverviewTab({ resumes, loading, error, onNewResume }) {
  const best = resumes.reduce(
    (acc, r) => (acc === null || (r.ats_score ?? -1) > (acc.ats_score ?? -1) ? r : acc),
    null
  )
  const reviewed = resumes.filter((r) => r.ats_score !== null && r.ats_score !== undefined).length
  const avg =
    resumes.length > 0
      ? Math.round(resumes.reduce((s, r) => s + (r.ats_score ?? 0), 0) / resumes.length)
      : null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl py-4">Overview</h1>
          <p className="mt-1 text-sm text-slate-400">Where your resume work stands right now.</p>
        </div>
        <button
          onClick={onNewResume}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Plus size={16} /> New resume
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Glass className="p-10 text-center text-sm text-slate-400">
          <Loader2 size={18} className="mx-auto mb-2 animate-spin text-cyan-300" />
          Loading your resumes…
        </Glass>
      ) : (
        <>
          <ScoreCard resume={best} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={FileText} label="Resumes" value={resumes.length} />
            <StatCard icon={CheckCircle2} label="Reviewed" value={reviewed} />
            <StatCard icon={Trophy} label="Best score" value={best ? `${best.ats_score}/100` : "—"} />
            <StatCard icon={Gauge} label="Avg score" value={avg !== null ? `${avg}/100` : "—"} />
          </div>
        </>
      )}
    </div>
  )
}
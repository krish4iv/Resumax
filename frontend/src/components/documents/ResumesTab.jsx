// src/components/documents/ResumesTab.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Calendar, Loader2, File as FileIcon } from "lucide-react"
import Glass from "./Glass.jsx"
import ScoreCard from "./ScoreCard.jsx"
import ErrorBanner from "./ErrorBanner.jsx"
import { formatDate } from "./utils.js"

export default function ResumesTab({ resumes, loading, error, onRefresh }) {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Glass className="p-10 text-center text-sm text-slate-400">
          <Loader2 size={18} className="mx-auto mb-2 animate-spin text-cyan-300" />
          Loading resumes…
        </Glass>
      ) : resumes.length === 0 ? (
        <Glass className="p-10 text-center">
          <FileIcon size={22} className="mx-auto text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No resumes saved yet. Upload one from the AI Review tab.
          </p>
        </Glass>
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => (
            <div key={r.id ?? r.filename}>
              <Glass className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]">
                <button
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className="flex min-w-0 items-center gap-3 flex-1 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <FileText size={16} className="text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{r.filename ?? "Untitled resume"}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={11} />
                      {formatDate(r.createdAt ?? r.created_at)}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      (r.ats_score ?? 0) >= 80
                        ? "bg-emerald-400/15 text-emerald-300"
                        : (r.ats_score ?? 0) >= 50
                        ? "bg-amber-400/15 text-amber-300"
                        : "bg-rose-400/15 text-rose-300"
                    }`}
                  >
                    {r.ats_score ?? "—"}/100
                  </span>
                  <button
                    onClick={() => navigate(`/resume-builder/${r.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Edit
                  </button>
                </div>
              </Glass>

              {expandedId === r.id && (
                <div className="mt-3">
                  <ScoreCard resume={r} eyebrow={r.filename} showDetails />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// src/components/documents/ScoreCard.jsx
import { CheckCircle2, Gauge, Sparkles } from "lucide-react"
import Glass from "./Glass.jsx"
import { CATEGORY_KEYS, CATEGORY_LABELS, CATEGORY_MAX, SEVERITY_STYLES } from "./constants.js"
import { clampScore } from "./utils.js"

function FindingCard({ finding }) {
  const style = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.medium
  const Icon = style.icon
  return (
    <div className={`flex items-start gap-3 rounded-2xl border ${style.border} ${style.bg} px-4 py-3.5`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${style.color}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${style.color}`}>{finding.issue}</p>
        <p className="mt-1 text-sm text-slate-300 leading-relaxed">{finding.detail}</p>
      </div>
    </div>
  )
}

function StrengthsList({ strengths }) {
  if (!strengths?.length) return null
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        <Sparkles size={12} className="text-cyan-300" />
        What's working
      </p>
      <div className="space-y-2">
        {strengths.map((s, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------
   Shared score display — used by Overview and AI Review
----------------------------------------------------------------*/
export default function ScoreCard({ resume, eyebrow, showDetails = false }) {
  if (!resume) {
    return (
      <Glass className="p-8 text-center">
        <Gauge size={22} className="mx-auto text-slate-500" />
        <p className="mt-3 text-sm text-slate-400">No scored resumes yet — upload one in AI Review.</p>
      </Glass>
    )
  }

  const score = resume.ats_score ?? 0
  const findings = resume.findings ?? []
  const strengths = resume.strengths ?? []

  return (
    <Glass className="p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
        {eyebrow ?? resume.filename ?? "Latest analysis"}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        Your strongest resume score:{" "}
        <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
          {score}/100
        </span>
      </h2>

      <div className="mt-7 space-y-4">
        {CATEGORY_KEYS.map((key) => {
          const max = CATEGORY_MAX[key]
          const value = clampScore(resume[key], max)
          const percent = (value / max) * 100

          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">{CATEGORY_LABELS[key]}</span>
                <span className="font-medium text-slate-300">{value}/{max}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300 transition-[width] duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {showDetails && (strengths.length > 0 || findings.length > 0) && (
        <div className="mt-8 space-y-6 border-t border-white/8 pt-6">
          <StrengthsList strengths={strengths} />

          {findings.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                What we found — {findings.length} {findings.length === 1 ? "fix" : "fixes"}
              </p>
              <div className="space-y-2.5">
                {findings.map((f, i) => (
                  <FindingCard key={i} finding={f} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Glass>
  )
}
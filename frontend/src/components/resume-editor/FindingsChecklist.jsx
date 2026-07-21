// src/components/resume-editor/FindingsChecklist.jsx
import { CheckCircle2 } from "lucide-react"
import Glass from "./Glass.jsx"
import { SEVERITY_STYLES } from "./constants.js"

export default function FindingsChecklist({ findings, dismissed, onToggle }) {
  const active = findings.filter((_, i) => !dismissed.has(i))
  if (findings.length === 0) return null

  return (
    <Glass className="p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 mb-3">
        Issues to fix — {active.length} of {findings.length} remaining
      </p>
      <div className="space-y-2">
        {findings.map((f, i) => {
          const isDone = dismissed.has(i)
          const style = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.medium
          const Icon = style.icon
          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 transition-all ${
                isDone ? "border-white/[0.06] bg-white/[0.02] opacity-50" : `${style.border} ${style.bg}`
              }`}
            >
              <button onClick={() => onToggle(i)} className="mt-0.5 shrink-0">
                {isDone ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Icon size={16} className={style.color} />}
              </button>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${isDone ? "text-slate-500 line-through" : style.color}`}>
                  {f.issue}
                </p>
                <p className={`mt-0.5 text-xs leading-relaxed ${isDone ? "text-slate-600" : "text-slate-300"}`}>
                  {f.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Glass>
  )
}
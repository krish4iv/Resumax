import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout.jsx"
import {
  getResumes, createResume, analyzeResume
} from "../services/resume.service.js"
import {
  FileText, CheckCircle2, Trophy, Gauge, UploadCloud,
  Loader2, Plus, Calendar, AlertCircle, RefreshCcw,
  File as FileIcon, X, ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles
} from "lucide-react"


const SEVERITY_STYLES = {
  high:   { icon: ShieldAlert,    color: "text-rose-300",    bg: "bg-rose-400/[0.08]",    border: "border-rose-400/20"    },
  medium: { icon: ShieldQuestion, color: "text-amber-300",   bg: "bg-amber-400/[0.08]",   border: "border-amber-400/20"   },
  low:    { icon: ShieldCheck,    color: "text-emerald-300", bg: "bg-emerald-400/[0.08]", border: "border-emerald-400/20" },
}

const CATEGORY_LABELS = {
  content_quality: "Content Quality",
  ats_structure: "ATS Structure",
  job_optimization: "Job Optimization",
  writing_quality: "Writing Quality",
  app_ready: "App Ready",
}

const CATEGORY_MAX = {
  content_quality: 40,
  ats_structure: 20,
  job_optimization: 25,
  writing_quality: 10,
  app_ready: 5,
}

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS)

function Glass({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag
      className={`rounded-3xl border border-white/[0.12] bg-white/[0.05] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function formatDate(value) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    })
  } catch {
    return value
  }
}

function clampScore(v, max = 100) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(max, Math.round(n)))
}


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
function ScoreCard({ resume, eyebrow, showDetails = false }) {
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

/* ---------------------------------------------------------------
   Tabs
----------------------------------------------------------------*/
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "resumes", label: "Resumes" },
  { id: "ai-review", label: "AI Review" },
]

function TabBar({ active, onChange }) {
  return (
    <Glass className="inline-flex items-center gap-1 rounded-full p-1.5">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            active === t.id ? "bg-white text-black" : "text-slate-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {t.label}
        </button>
      ))}
    </Glass>
  )
}

/* ---------------------------------------------------------------
   Overview tab
----------------------------------------------------------------*/
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

function OverviewTab({ resumes, loading, error, onNewResume }) {
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

/* ---------------------------------------------------------------
   Resumes tab
----------------------------------------------------------------*/

function ResumesTab({ resumes, loading, error, onRefresh }) {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="space-y-6">
      {/* ...header unchanged... */}
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
              <Glass
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-3">
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
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    (r.ats_score ?? 0) >= 80
                      ? "bg-emerald-400/15 text-emerald-300"
                      : (r.ats_score ?? 0) >= 50
                      ? "bg-amber-400/15 text-amber-300"
                      : "bg-rose-400/15 text-rose-300"
                  }`}
                >
                  {r.ats_score ?? "—"}/100
                </span>
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

/* ---------------------------------------------------------------
   AI Review tab — dropzone, analyze, save, show results
----------------------------------------------------------------*/
function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function Dropzone({ file, onFile, disabled }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(fileList) {
    const f = fileList?.[0]
    if (!f) return
    if (f.type !== "application/pdf") {
      onFile(null, "Please upload a PDF file.")
      return
    }
    onFile(f, null)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (!disabled) handleFiles(e.dataTransfer.files)
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/[0.02]"
          : dragOver
          ? "border-cyan-300/60 bg-cyan-300/[0.06]"
          : "border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <>
          <FileIcon size={26} className="text-cyan-300" />
          <p className="mt-3 text-sm font-medium text-white">{file.name}</p>
          <p className="mt-1 text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB · click to replace</p>
        </>
      ) : (
        <>
          <UploadCloud size={26} className="text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-200">Drop your resume PDF here</p>
          <p className="mt-1 text-xs text-slate-500">or click to browse · PDF only</p>
        </>
      )}
    </div>
  )
}

function AIReviewTab({ onSaved }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  function handleFile(f, err) {
    setResult(null)
    setError(err)
    setStatus("idle")
    setFile(f)
  }

  async function handleAnalyze() {
  if (!file) return
  setStatus("analyzing")
  setError(null)
  try {
    const analysis = await analyzeResume(file)
    console.log('FULL ANALYSIS RESPONSE:', analysis)  // ← add here

    const record = {
      filename: file.name,
      ats_score: analysis.ats_score,
      content_quality: analysis.content_quality,
      ats_structure: analysis.ats_structure,
      job_optimization: analysis.job_optimization,
      writing_quality: analysis.writing_quality,
      app_ready: analysis.app_ready,
      strengths: analysis.strengths || [],
      findings: analysis.findings || [],
    }

      setStatus("saving")
      const saved = await createResume(record)

      setResult(saved?.id ? saved : record)
      setStatus("done")
      onSaved?.()
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Something went wrong during analysis.")
      setStatus("error")
    }
  }

  const busy = status === "analyzing" || status === "saving"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">AI Review</h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload a resume and Nova will score it against ATS and quality benchmarks.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <Dropzone file={file} onFile={handleFile} disabled={busy} />

      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={!file || busy}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {status === "analyzing" && "Analyzing…"}
          {status === "saving" && "Saving…"}
          {status !== "analyzing" && status !== "saving" && "Analyze resume"}
        </button>
        {file && !busy && (
          <button
            onClick={() => handleFile(null, null)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {status === "done" && result && (
        <ScoreCard resume={result} eyebrow={`Analysis complete · ${result.filename}`} showDetails />
      )}  
    </div>
  )
}

/* ---------------------------------------------------------------
   Documents page — wrapped in MainLayout like every other page
----------------------------------------------------------------*/
export default function Documents() {
  const navigate = useNavigate()
  const [active, setActive] = useState("overview")
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchResumes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getResumes()
      setResumes(Array.isArray(data) ? data : data.resumes ?? [])
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load your resumes.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])



  return (
    <MainLayout>
      <div className="p-10 py-2 items-center justify-center h-full w-full animate-fade-in">
        <TabBar active={active} onChange={setActive} />

        {active === "overview" && (
          <OverviewTab
            resumes={resumes}
            loading={loading}
            error={error}
            onNewResume={() => navigate('/resume')}
          />
        )}
        {active === "resumes" && (
          <ResumesTab resumes={resumes} loading={loading} error={error} onRefresh={fetchResumes} />
        )}
        {active === "ai-review" && <AIReviewTab onSaved={fetchResumes} />}
      </div>
    </MainLayout>
  )
}
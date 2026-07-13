import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Circle, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Loader2,
  Target, ExternalLink, PlayCircle, AlertCircle
} from "lucide-react"
import {
  listQuestions, updateQuestionProgress, getInterviewStats
} from "../../services/interview.service.js"

const DIFFICULTY_COLOR = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
}

const STATUS_ORDER = ["todo", "attempted", "solved"]

function nextStatus(status) {
  const i = STATUS_ORDER.indexOf(status)
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length]
}

// Canonical NeetCode 150 pattern sequence — the backend sorts categories
// alphabetically, which buries "Two Pointers" near the bottom. This fixed
// order is what the roadmap (and the checklist) is supposed to follow.
const CATEGORY_ORDER = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
]

function categoryRank(category) {
  const idx = CATEGORY_ORDER.findIndex(
    (c) => c.toLowerCase() === (category || "").toLowerCase()
  )
  // unrecognized categories sort after all known ones, alphabetically among themselves
  return idx === -1 ? CATEGORY_ORDER.length : idx
}

function StatusDot({ status }) {
  if (status === "solved") {
    return <CheckCircle2 size={18} className="text-cyan-400" />
  }
  if (status === "attempted") {
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      </span>
    )
  }
  return <Circle size={18} className="text-slate-600" />
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function Pill({ active, disabled, children, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-white text-slate-950"
          : "bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}

function QuestionRow({ question, onCycleStatus, onToggleExpand, expanded, pending }) {
  const meta = question.metadata || {}
  const hasLinks = meta.leetcode_url || meta.neetcode_url || meta.video_id

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => onCycleStatus(question)}
          disabled={pending}
          className="shrink-0 disabled:opacity-50"
          aria-label="Cycle status"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin text-slate-500" />
          ) : (
            <StatusDot status={question.status} />
          )}
        </button>
        <button
          onClick={() => onToggleExpand(question.id)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <span
            className={`truncate text-sm ${
              question.status === "solved" ? "text-slate-500 line-through" : "text-slate-200"
            }`}
          >
            {question.title}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {question.difficulty && (
              <span className={`text-[11px] font-semibold ${DIFFICULTY_COLOR[question.difficulty] || "text-slate-500"}`}>
                {question.difficulty}
              </span>
            )}
            {question.company_tags?.length > 0 && (
              <span className="text-[10px] text-slate-600">{question.company_tags.length} cos</span>
            )}
            {expanded ? (
              <ChevronDown size={15} className="text-slate-500" />
            ) : (
              <ChevronRight size={15} className="text-slate-500" />
            )}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="flex flex-wrap gap-2 border-t border-white/[0.04] px-4 pb-4 pt-3">
          {meta.leetcode_url && (
            <a
              href={meta.leetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              LeetCode <ExternalLink size={11} />
            </a>
          )}
          {meta.neetcode_url && (
            <a
              href={meta.neetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              NeetCode <ExternalLink size={11} />
            </a>
          )}
          {meta.video_id && (
            <a
              href={`https://www.youtube.com/watch?v=${meta.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              <PlayCircle size={12} /> Walkthrough
            </a>
          )}
          {!hasLinks && <span className="text-xs text-slate-600">No links available for this problem yet.</span>}
        </div>
      )}
    </div>
  )
}

function CategorySection({
  category, items, collapsed, onToggleCollapse,
  onCycleStatus, onToggleExpand, expandedId, pendingIds,
}) {
  return (
    <div>
      <button
        onClick={onToggleCollapse}
        className="mb-2.5 flex w-full items-center gap-2 text-left"
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-slate-500" />
        ) : (
          <ChevronUp size={14} className="text-slate-500" />
        )}
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-300">{category}</h2>
        <span className="text-[11px] text-slate-600">{items.length}</span>
      </button>
      {!collapsed && (
        <div className="space-y-2">
          {items.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              onCycleStatus={onCycleStatus}
              onToggleExpand={onToggleExpand}
              expanded={expandedId === q.id}
              pending={pendingIds.has(q.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * "Coding" tab — Full 150 / Blind 75 checklist grouped by pattern (category).
 * @param {string|null} selectedCompany  company slug chosen on the My Plan tab
 */
export default function CodingChecklist({ selectedCompany }) {
  const [list, setList] = useState("full150") // "full150" | "blind75"
  const [difficulty, setDifficulty] = useState("")
  const [status, setStatus] = useState("")
  const [companyFocus, setCompanyFocus] = useState(false)

  const [questions, setQuestions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())
  const [pendingIds, setPendingIds] = useState(new Set())

  // company focus only applies while a company is actually selected
  useEffect(() => {
    if (!selectedCompany) setCompanyFocus(false)
  }, [selectedCompany])

  const activeCompany = companyFocus ? selectedCompany : undefined

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [qData, sData] = await Promise.all([
        listQuestions({ module: "coding", list, difficulty, status, company: activeCompany }),
        getInterviewStats("coding"),
      ])
      setQuestions(Array.isArray(qData) ? qData : [])
      setStats(sData)
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not load coding questions.")
    } finally {
      setLoading(false)
    }
  }, [list, difficulty, status, activeCompany])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleCycleStatus(question) {
    if (pendingIds.has(question.id)) return // ignore double-clicks mid-request

    const prevStatus = question.status
    const next = nextStatus(prevStatus)

    setPendingIds((prev) => new Set(prev).add(question.id))

    // If a status filter is active and the new status no longer matches it,
    // drop the row immediately instead of waiting for the next full refetch —
    // this is what was reading as "delay" before.
    if (status && next !== status) {
      setQuestions((prev) => prev.filter((q) => q.id !== question.id))
    } else {
      setQuestions((prev) => prev.map((q) => (q.id === question.id ? { ...q, status: next } : q)))
    }

    // Optimistic stat-card update — don't make the top cards wait on a
    // second network round-trip (PATCH, then GET stats) before reflecting
    // the click. This is what was showing as "0 Solved" for several
    // seconds after checking a question off.
    setStats((prev) => {
      if (!prev) return prev
      const next2 = { ...prev }
      if (prevStatus === "solved") next2.solved = Math.max(0, next2.solved - 1)
      if (next === "solved") next2.solved = (next2.solved || 0) + 1
      if (prevStatus === "attempted") next2.attempted = Math.max(0, next2.attempted - 1)
      if (next === "attempted") next2.attempted = (next2.attempted || 0) + 1
      if (question.metadata?.blind75) {
        if (prevStatus === "solved") next2.blind75_solved = Math.max(0, next2.blind75_solved - 1)
        if (next === "solved") next2.blind75_solved = (next2.blind75_solved || 0) + 1
      }
      return next2
    })

    try {
      await updateQuestionProgress(question.id, next)
      const sData = await getInterviewStats("coding")
      setStats(sData) // reconcile with server truth (patterns_covered etc.) in the background
    } catch (e) {
      // revert on failure — re-fetch is the safest way back to a correct list
      fetchAll()
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(question.id)
        return next
      })
    }
  }

  function toggleCategoryCollapse(category) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      next.has(category) ? next.delete(category) : next.add(category)
      return next
    })
  }

  const grouped = useMemo(() => {
    const map = new Map()
    for (const q of questions) {
      if (!map.has(q.category)) map.set(q.category, [])
      map.get(q.category).push(q)
    }
    return Array.from(map.entries()).sort(
      ([a], [b]) => categoryRank(a) - categoryRank(b) || a.localeCompare(b)
    )
  }, [questions])

  const nextUp = questions.find((q) => q.status === "todo")
  const totalForList = list === "blind75" ? 75 : 150

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
          Interview / Coding
        </p>
        <h1 className="text-3xl font-bold text-white">Coding checklist</h1>
        <p className="mt-1 text-sm text-slate-500">
          Work the patterns the way your target interviews on them. Status saves as you go and
          follows you across every company.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard value={stats?.solved ?? "—"} label="Solved" />
        <StatCard value={stats?.attempted ?? "—"} label="Attempted" />
        <StatCard value={stats ? `${stats.blind75_solved}/${stats.blind75_total}` : "—"} label="Blind 75" />
        <StatCard value={stats ? `${stats.patterns_covered}/${stats.patterns_total}` : "—"} label="Patterns" />
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {totalForList} PROBLEMS · {list === "blind75" ? "BLIND 75" : "NEETCODE 150"}
        </p>
        <div className="mt-2 h-1 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-pink-400 transition-[width] duration-500"
            style={{
              width: `${stats ? Math.min(100, ((stats.solved || 0) / totalForList) * 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {nextUp && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Target size={13} className="text-pink-400" />
          Next up: <span className="font-medium text-white">{nextUp.title}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Pill active={companyFocus} disabled={!selectedCompany} onClick={() => setCompanyFocus((v) => !v)}>
          Company focus
        </Pill>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <Pill active={list === "full150"} onClick={() => setList("full150")}>Full 150</Pill>
          <Pill active={list === "blind75"} onClick={() => setList("blind75")}>Blind 75</Pill>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {["Easy", "Medium", "Hard"].map((d) => (
            <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(difficulty === d ? "" : d)}>
              {d}
            </Pill>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {["todo", "attempted", "solved"].map((s) => (
            <Pill key={s} active={status === s} onClick={() => setStatus(status === s ? "" : s)}>
              {s === "todo" ? "To do" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Pill>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
          <p className="text-sm text-slate-500">No questions match these filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              collapsed={collapsedCategories.has(category)}
              onToggleCollapse={() => toggleCategoryCollapse(category)}
              onCycleStatus={handleCycleStatus}
              onToggleExpand={(id) => setExpandedId((prev) => (prev === id ? null : id))}
              expandedId={expandedId}
              pendingIds={pendingIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}
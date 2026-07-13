import { useEffect, useMemo, useState } from "react"
import { Search, Check, AlertCircle } from "lucide-react"
import { listCompanies } from "../../services/interview.service.js"

const AVATAR_PALETTE = [
  "bg-rose-500/15 text-rose-300 border-rose-500/20",
  "bg-blue-500/15 text-blue-300 border-blue-500/20",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  "bg-amber-500/15 text-amber-300 border-amber-500/20",
  "bg-violet-500/15 text-violet-300 border-violet-500/20",
  "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
]

function paletteFor(name = "") {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function CompanyAvatar({ company }) {
  if (company.logo_url) {
    return (
      <img
        src={company.logo_url}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
      />
    )
  }
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${paletteFor(
        company.name
      )}`}
    >
      {company.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

/**
 * "My Plan" tab — pick a company to focus interview prep on.
 * Selection is lifted to the parent so the Coding/System Design/Behavioral
 * tabs can filter by it via the "Company focus" toggle.
 */
export default function CompanyPicker({ selectedCompany, onSelectCompany }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await listCompanies()
        if (!cancelled) setCompanies(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || "Could not load companies.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) => c.name.toLowerCase().includes(q))
  }, [companies, search])

  function handlePick(slug) {
    onSelectCompany(selectedCompany === slug ? null : slug)
  }

  const selectedName = companies.find((c) => c.slug === selectedCompany)?.name

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold text-white">Build your interview prep</h1>
      <p className="mt-4 leading-relaxed text-slate-400">
        Pick who you are interviewing with. We turn the real, reported questions into a
        sequenced plan made for you, then you can regenerate it anytime.
      </p>

      <div className="relative mt-8">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies"
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-cyan-400/40 focus:bg-white/[0.06] focus:outline-none"
        />
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-[60px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">No companies match "{search}".</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const active = selectedCompany === c.slug
            return (
              <button
                key={c.slug}
                onClick={() => handlePick(c.slug)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                  active
                    ? "border-pink-400/40 bg-pink-400/[0.08]"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
                }`}
              >
                <CompanyAvatar company={c} />
                <span className="flex-1 truncate text-sm font-medium text-white">{c.name}</span>
                {active && <Check size={15} className="shrink-0 text-pink-300" />}
              </button>
            )
          })}
        </div>
      )}

      {selectedCompany && (
        <p className="mt-6 text-xs text-slate-500">
          Focusing on <span className="font-medium text-pink-300">{selectedName}</span> — use
          the "Company focus" filter on the Coding tab to see their questions first.
        </p>
      )}
    </div>
  )
}
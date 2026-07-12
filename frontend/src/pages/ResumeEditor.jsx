import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout.jsx"
import {
  getResumeById, createResume, updateResumeContent,
  rewriteBullet, generatePDF
} from "../services/resume.service.js"
import api from "../services/api.service.js"
import { auth } from "../config/firebase.js"
import {
  ArrowLeft, Plus, X, Sparkles, Loader2, Download,
  User, GraduationCap, Briefcase, FolderGit2, Wrench,
  ChevronDown, ChevronUp, Undo2, Check
} from "lucide-react"
import ExperienceModal from "../components/resume/ExperienceModal.jsx"
import ProjectModal from "../components/resume/ProjectModal.jsx"
import PersonalInfoModal from "../components/resume/PersonalInfoModal.jsx"
import SummaryModal from "../components/resume/SummaryModal.jsx"
import EducationModal from "../components/resume/EducationModal.jsx"
import SkillsModal from "../components/resume/SkillsModal.jsx"
import { Pencil } from "lucide-react"
import { ShieldAlert, ShieldQuestion, ShieldCheck, CheckCircle2 } from "lucide-react"

/* ---------------------------------------------------------------
   Empty content shape
   NOTE the two shape changes from before:
   - personal.linkedin / personal.github -> personal.links: [{label, url}]
   - skills: string[] -> skills: [{ name, category }]
----------------------------------------------------------------*/
const SEVERITY_STYLES = {
  high:   { icon: ShieldAlert,    color: "text-rose-300",    bg: "bg-rose-400/[0.08]",    border: "border-rose-400/20"    },
  medium: { icon: ShieldQuestion, color: "text-amber-300",   bg: "bg-amber-400/[0.08]",   border: "border-amber-400/20"   },
  low:    { icon: ShieldCheck,    color: "text-emerald-300", bg: "bg-emerald-400/[0.08]", border: "border-emerald-400/20" },
}

const emptyContent = {
  personal: { name: "", email: "", phone: "", links: [] },
  summary: "",
  education: [],
  experience: [],  // { role, company, location, start_date, end_date, current, bullets[] }
  projects: [],    // { name, tech, links[], start_date, end_date, current, bullets[] }
  skills: [],      // { name, category }
}

function Glass({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

function FindingsChecklist({ findings, dismissed, onToggle }) {
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

/* ---------------------------------------------------------------
   Collapsible section wrapper
----------------------------------------------------------------*/
function Section({ icon: Icon, title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Glass className="overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-cyan-300" />
          <span className="text-sm font-semibold text-white">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-slate-500">{count}</span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </Glass>
  )
}

/* ---------------------------------------------------------------
   Personal Info — display card + edit modal (with links)
----------------------------------------------------------------*/
function PersonalSection({ personal, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const links = personal.links || []

  return (
    <Section icon={User} title="Personal Info">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full text-left rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all p-3.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{personal.name || "Your Name"}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {[personal.email, personal.phone].filter(Boolean).join(" · ") || "No contact info yet"}
            </p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 mt-0.5" />
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {links.map((l, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {l.label}
              </span>
            ))}
          </div>
        )}
      </button>

      <PersonalInfoModal
        open={modalOpen}
        initial={personal}
        onClose={() => setModalOpen(false)}
        onSave={data => { onChange(data); setModalOpen(false) }}
      />
    </Section>
  )
}

/* ---------------------------------------------------------------
   Summary — display card + edit modal (no AI, plain text edit)
----------------------------------------------------------------*/
function SummarySection({ summary, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Section icon={Sparkles} title="Summary">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full text-left rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all p-3.5 flex items-start justify-between gap-2"
      >
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
          {summary || "No summary yet — click to add one."}
        </p>
        <Pencil size={13} className="text-slate-500 shrink-0 mt-0.5" />
      </button>

      <SummaryModal
        open={modalOpen}
        initial={summary}
        onClose={() => setModalOpen(false)}
        onSave={text => { onChange(text); setModalOpen(false) }}
      />
    </Section>
  )
}

/* ---------------------------------------------------------------
   Education — repeatable, now modal-based like Experience/Projects
----------------------------------------------------------------*/
function EducationSection({ items, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  function openAdd() {
    setEditIndex(null)
    setModalOpen(true)
  }
  function openEdit(i) {
    setEditIndex(i)
    setModalOpen(true)
  }
  function handleSave(data) {
    const next = [...items]
    if (editIndex === null) next.push(data)
    else next[editIndex] = data
    onChange(next)
    setModalOpen(false)
  }
  function handleDelete() {
    onChange(items.filter((_, idx) => idx !== editIndex))
    setModalOpen(false)
  }

  return (
    <Section icon={GraduationCap} title="Education" count={items.length}>
      {items.map((edu, i) => (
        <button
          key={i}
          onClick={() => openEdit(i)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{edu.school || "Untitled school"}</p>
            <p className="text-xs text-slate-500 truncate">
              {[edu.degree, edu.field].filter(Boolean).join(", ") || "No details yet"}
            </p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
        </button>
      ))}
      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add education
      </button>

      <EducationModal
        open={modalOpen}
        initial={editIndex !== null ? items[editIndex] : null}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}

/* ---------------------------------------------------------------
   Experience — unchanged, still uses ExperienceModal (has AI rewrite)
----------------------------------------------------------------*/
function ExperienceSection({ items, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  function openAdd() {
    setEditIndex(null)
    setModalOpen(true)
  }
  function openEdit(i) {
    setEditIndex(i)
    setModalOpen(true)
  }
  function handleSave(data) {
    const next = [...items]
    if (editIndex === null) next.push(data)
    else next[editIndex] = data
    onChange(next)
    setModalOpen(false)
  }
  function handleDelete() {
    onChange(items.filter((_, idx) => idx !== editIndex))
    setModalOpen(false)
  }

  return (
    <Section icon={Briefcase} title="Experience" count={items.length}>
      {items.map((exp, i) => (
        <button
          key={i}
          onClick={() => openEdit(i)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{exp.role || "Untitled role"}</p>
            <p className="text-xs text-slate-500 truncate">{exp.company} {exp.location ? `· ${exp.location}` : ""}</p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
        </button>
      ))}
      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add experience
      </button>

      <ExperienceModal
        open={modalOpen}
        initial={editIndex !== null ? items[editIndex] : null}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}

/* ---------------------------------------------------------------
   Projects — unchanged, still uses ProjectModal (has AI rewrite)
----------------------------------------------------------------*/
function ProjectsSection({ items, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  function openAdd() {
    setEditIndex(null)
    setModalOpen(true)
  }
  function openEdit(i) {
    setEditIndex(i)
    setModalOpen(true)
  }
  function handleSave(data) {
    const next = [...items]
    if (editIndex === null) next.push(data)
    else next[editIndex] = data
    onChange(next)
    setModalOpen(false)
  }
  function handleDelete() {
    onChange(items.filter((_, idx) => idx !== editIndex))
    setModalOpen(false)
  }

  return (
    <Section icon={FolderGit2} title="Projects" count={items.length}>
      {items.map((p, i) => (
        <button
          key={i}
          onClick={() => openEdit(i)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{p.name || "Untitled project"}</p>
            <p className="text-xs text-slate-500 truncate">{p.tech || "No tech listed"}</p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
        </button>
      ))}
      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add project
      </button>

      <ProjectModal
        open={modalOpen}
        initial={editIndex !== null ? items[editIndex] : null}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}
    
/* ---------------------------------------------------------------
   Skills — now category-grouped, modal-based add/edit
----------------------------------------------------------------*/
function SkillsSection({ skills, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  // attach original index so edit/delete target the right entry after grouping
  const withIndex = skills.map((s, i) => ({ ...s, _i: i, category: s.category || "Other" }))
  const categories = [...new Set(withIndex.map(s => s.category))]
  const existingCategories = [...new Set(skills.map(s => s.category).filter(Boolean))]

  function openAdd() {
    setEditIndex(null)
    setModalOpen(true)
  }
  function openEdit(i) {
    setEditIndex(i)
    setModalOpen(true)
  }
  function handleSave(data) {
    const next = [...skills]
    if (editIndex === null) next.push(data)
    else next[editIndex] = data
    onChange(next)
    setModalOpen(false)
  }
  function handleDelete() {
    onChange(skills.filter((_, idx) => idx !== editIndex))
    setModalOpen(false)
  }

  return (
    <Section icon={Wrench} title="Skills" count={skills.length}>
      {categories.length > 0 ? (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {withIndex.filter(s => s.category === cat).map(s => (
                  <button
                    key={s._i}
                    onClick={() => openEdit(s._i)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">No skills yet.</p>
      )}

      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add skill
      </button>

      <SkillsModal
        open={modalOpen}
        initial={editIndex !== null ? skills[editIndex] : null}
        existingCategories={existingCategories}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}

/* ---------------------------------------------------------------
   Live preview
----------------------------------------------------------------*/
function Preview({ content }) {
  const { personal, summary, education, experience, projects, skills } = content
  const personalLinks = personal.links || []

  const skillsByCategory = (skills || []).reduce((acc, s) => {
    const cat = s.category || "Other"
    acc[cat] = acc[cat] || []
    acc[cat].push(s.name)
    return acc
  }, {})

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-8 min-h-[600px] shadow-2xl">
      <div className="text-center border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold">{personal.name || "Your Name"}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {[personal.email, personal.phone, ...personalLinks.map(l => l.url)].filter(Boolean).join(" | ")}
        </p>
      </div>

      {summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {education?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Education</h2>
          {education.map((e, i) => (
            <div key={i} className="mb-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{e.school || "School"}</span>
                <span className="text-slate-500 text-xs">
                  {e.start_date}{e.start_date ? " – " : ""}{e.current ? "Present" : e.end_date}
                </span>
              </div>
              <p className="text-xs text-slate-600">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {experience?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Experience</h2>
          {experience.map((e, i) => (
            <div key={i} className="mb-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{e.role || "Role"} — {e.company}{e.location ? ` (${e.location})` : ""}</span>
                <span className="text-slate-500 text-xs">{e.start_date}{e.start_date ? " – " : ""}{e.current ? "Present" : e.end_date}</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
                {(e.bullets || []).filter(b => b.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {projects?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="mb-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">
                  {p.name}{p.tech ? ` | ${p.tech}` : ""}
                </span>
                <span className="text-slate-500 text-xs">{p.start_date}{p.start_date ? " – " : ""}{p.current ? "Present" : p.end_date}</span>
              </div>
              {p.links?.length > 0 && (
                <p className="text-xs text-blue-600 mt-0.5">
                  {p.links.map((l, li) => (
                    <span key={li}>
                      {li > 0 && " | "}
                      {l.label}: {l.url}
                    </span>
                  ))}
                </p>
              )}
              <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
                {(p.bullets || []).filter(b => b.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {skills?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Skills</h2>
          {Object.entries(skillsByCategory).map(([cat, names]) => (
            <p key={cat} className="text-xs text-slate-700 mb-0.5">
              <span className="font-semibold">{cat}:</span> {names.join(", ")}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------
   Main editor
----------------------------------------------------------------*/
export default function ResumeEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === "new"

  const [resumeId, setResumeId] = useState(isNew ? null : id)
  const [filename, setFilename] = useState("Untitled Resume")
  const [content, setContent] = useState(emptyContent)
  const [loading, setLoading] = useState(!isNew)
  const [saveStatus, setSaveStatus] = useState("idle") // idle | saving | saved
  const [downloading, setDownloading] = useState(false)
  const saveTimer = useRef(null)
  const [findings, setFindings] = useState([])
  const [dismissedFindings, setDismissedFindings] = useState(new Set())
  const [leftPanel, setLeftPanel] = useState("edit") // "edit" | "checklist"

  // Load existing resume, or prefill personal info for new ones
  useEffect(() => {
    async function load() {
      if (!isNew) {
        try {
          const resume = await getResumeById(id)
          setFilename(resume.filename || "Untitled Resume")
          const loaded = { ...emptyContent, ...(resume.content || {}) }
          // normalize legacy shapes so older saved resumes don't break the new UI
          loaded.personal = {
            ...emptyContent.personal,
            ...loaded.personal,
            links: loaded.personal?.links
              ?? [
                loaded.personal?.linkedin && { label: "LinkedIn", url: loaded.personal.linkedin },
                loaded.personal?.github && { label: "GitHub", url: loaded.personal.github },
              ].filter(Boolean),
          }
          loaded.skills = (loaded.skills || []).map(s =>
            typeof s === "string" ? { name: s, category: "Other" } : s
          )
          setContent(loaded)
          setFindings(resume.findings || [])
          console.log("Loaded resume:", loaded)
        } catch (err) {
          console.error("Failed to load resume:", err)
        } finally {
          setLoading(false)
        }
      } else {
        try {
          const token = await auth.currentUser.getIdToken()
          const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
          const user = res.data.user
          setContent(prev => ({
            ...prev,
            personal: { ...prev.personal, name: user.name || "", email: user.email || "" },
            skills: (user.skills || []).map(s =>
              typeof s === "string" ? { name: s, category: "Other" } : s
            ),
          }))
        } catch (err) {
          console.error("Failed to prefill profile:", err)
        }
      }
    }
    load()
  }, [id, isNew])

  // Debounced autosave
  const save = useCallback(async (nextContent, nextFilename) => {
    setSaveStatus("saving")
    try {
      if (!resumeId) {
        const created = await createResume({ filename: nextFilename, content: nextContent })
        setResumeId(created.id)
        navigate(`/resume-builder/${created.id}`, { replace: true })
      } else {
        await updateResumeContent(resumeId, nextContent, nextFilename)
      }
      setSaveStatus("saved")
    } catch (err) {
      console.error("Autosave failed:", err)
      setSaveStatus("idle")
    }
  }, [resumeId, navigate])

  function scheduleSave(nextContent, nextFilename = filename) {
    setContent(nextContent)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(nextContent, nextFilename), 1500)
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const url = await generatePDF({
        name: content.personal.name,
        email: content.personal.email,
        phone: content.personal.phone,
        summary: content.summary,
        skills: content.skills.map(s => s.name),
        projects: content.projects.map(p => ({ name: p.name, description: p.description })),
        template: "classic",
      })
      window.open(`http://localhost:8009${url}`, "_blank")
    } catch (err) {
      console.error("Failed to generate PDF:", err)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={26} className="animate-spin text-cyan-400" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-5 animate-fade-in">

        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/documents")} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white">
              <ArrowLeft size={16} />
            </button>
            <input
              value={filename}
              onChange={e => { setFilename(e.target.value); scheduleSave(content, e.target.value) }}
              className="text-lg font-semibold bg-transparent text-white outline-none border-b border-transparent hover:border-white/20 focus:border-cyan-400/40 transition-colors"
            />
            <span className="text-xs text-slate-500 flex items-center gap-1">
              {saveStatus === "saving" && <><Loader2 size={11} className="animate-spin" /> Saving…</>}
              {saveStatus === "saved" && <><Check size={11} className="text-emerald-400" /> Saved</>}
            </span>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download PDF
          </button>
        </div>

        {/* Editor + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.04] p-1">
              <button
                onClick={() => setLeftPanel("edit")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  leftPanel === "edit" ? "bg-white text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setLeftPanel("checklist")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  leftPanel === "checklist" ? "bg-white text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                Checklist
                {findings?.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                      leftPanel === "checklist" ? "bg-black/10 text-black" : "bg-cyan-400/15 text-cyan-300"
                    }`}
                  >
                    {findings.filter((_, i) => !dismissedFindings.has(i)).length}
                  </span>
                )}
              </button>
            </div>

            {leftPanel === "checklist" ? (
              <FindingsChecklist
                findings={findings}
                dismissed={dismissedFindings}
                onToggle={(i) => setDismissedFindings(prev => {
                  const next = new Set(prev)
                  next.has(i) ? next.delete(i) : next.add(i)
                  return next
                })}
              />
            ) : (
              <>
                <PersonalSection personal={content.personal} onChange={v => scheduleSave({ ...content, personal: v })} />
                <SummarySection summary={content.summary} onChange={v => scheduleSave({ ...content, summary: v })} />
                <EducationSection items={content.education} onChange={v => scheduleSave({ ...content, education: v })} />
                <ExperienceSection items={content.experience} onChange={v => scheduleSave({ ...content, experience: v })} />
                <ProjectsSection items={content.projects} onChange={v => scheduleSave({ ...content, projects: v })} />
                <SkillsSection skills={content.skills} onChange={v => scheduleSave({ ...content, skills: v })} />
              </>
            )}
          </div>

          <div className="lg:sticky lg:top-4">
            <Preview content={content} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
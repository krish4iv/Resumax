import { useState, useEffect } from "react"
import MainLayout from "../components/layout/MainLayout.jsx"
import { useSelector, useDispatch } from "react-redux"
import { setUser } from "../store/slice/authSlice.js"
import {
  updateProfile, getExperience, createExperience, updateExperience, deleteExperience,
  getEducation, createEducation, updateEducation, deleteEducation
} from "../services/profile.service.js"
import { analyzeResume } from "../services/resume.service.js"
import ExperienceModal from "../components/resume/ExperienceModal.jsx"
import EducationModal from "../components/resume/EducationModal.jsx"
import SkillsModal from "../components/resume/SkillsModal.jsx"
import {
  Briefcase, GraduationCap, Wrench, Plus, Pencil, X,
  Loader2, UploadCloud, Sparkles, Check, Target
} from "lucide-react"

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

function Glass({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl ${className}`} {...rest}>
      {children}
    </div>
  )
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "targeting", label: "Targeting" },
  { id: "skills", label: "Skills" },
]

/* ---------------------------------------------------------------
   Overview tab — career memory progress + experience + education
----------------------------------------------------------------*/
function OverviewTab({ user, experience, education, onExperienceChange, onEducationChange, onImportClick, importing }) {
  const [expModal, setExpModal] = useState({ open: false, index: null })
  const [eduModal, setEduModal] = useState({ open: false, index: null })

  const checks = [
    { label: "Experience", done: experience.length > 0 },
    { label: "Skills evidenced", done: (user.skills || []).length > 0 },
    { label: "Goals set", done: !!user.preferred_role },
    { label: "Location set", done: !!user.location },
  ]
  const doneCount = checks.filter(c => c.done).length

  async function saveExperience(data) {
    if (expModal.index === null) {
      const created = await createExperience(data)
      onExperienceChange([...experience, created])
    } else {
      const item = experience[expModal.index]
      const updated = await updateExperience(item.id, data)
      const next = [...experience]
      next[expModal.index] = updated
      onExperienceChange(next)
    }
    setExpModal({ open: false, index: null })
  }
  async function removeExperience() {
    const item = experience[expModal.index]
    await deleteExperience(item.id)
    onExperienceChange(experience.filter((_, i) => i !== expModal.index))
    setExpModal({ open: false, index: null })
  }

  async function saveEducation(data) {
    if (eduModal.index === null) {
      const created = await createEducation(data)
      onEducationChange([...education, created])
    } else {
      const item = education[eduModal.index]
      const updated = await updateEducation(item.id, data)
      const next = [...education]
      next[eduModal.index] = updated
      onEducationChange(next)
    }
    setEduModal({ open: false, index: null })
  }
  async function removeEducation() {
    const item = education[eduModal.index]
    await deleteEducation(item.id)
    onEducationChange(education.filter((_, i) => i !== eduModal.index))
    setEduModal({ open: false, index: null })
  }

  return (
    <div className="space-y-6">
      {/* Career memory */}
      <Glass className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">Career memory</p>
        <h2 className="text-xl font-bold text-white mb-4">Your career memory</h2>

        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold text-white">{doneCount}</span>
          <span className="text-sm text-slate-500 mb-1">/ {checks.length} strong</span>
        </div>
        <div className="flex gap-1.5 mb-4">
          {checks.map((c, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${c.done ? "bg-cyan-400" : "bg-white/10"}`} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          {checks.map(c => (
            <span key={c.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${c.done ? "bg-cyan-400" : "bg-white/20"}`} />
              {c.label}
            </span>
          ))}
        </div>

        <button
          onClick={onImportClick}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/15 border border-pink-500/20 text-pink-300 text-sm font-semibold hover:bg-pink-500/25 transition-all disabled:opacity-50"
        >
          {importing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {importing ? "Importing…" : "Import from resume"}
        </button>
      </Glass>

      {/* Experience */}
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Briefcase size={15} className="text-cyan-300" /> Experience — {experience.length} roles
          </p>
          <button
            onClick={() => setExpModal({ open: true, index: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Plus size={12} /> Add a role
          </button>
        </div>

        {experience.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 mb-3">No experience yet. Add your roles and what you did in them.</p>
            <button
              onClick={() => setExpModal({ open: true, index: null })}
              className="px-4 py-2 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400 transition-all"
            >
              + Add your first role
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {experience.map((exp, i) => (
              <button
                key={exp.id}
                onClick={() => setExpModal({ open: true, index: i })}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{exp.role}</p>
                  <p className="text-xs text-slate-500 truncate">{exp.company} {exp.location ? `· ${exp.location}` : ""}</p>
                </div>
                <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </Glass>

      {/* Education */}
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <GraduationCap size={15} className="text-cyan-300" /> Education — {education.length}
          </p>
          <button
            onClick={() => setEduModal({ open: true, index: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Plus size={12} /> Add education
          </button>
        </div>

        {education.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No education added yet.</p>
        ) : (
          <div className="space-y-2">
            {education.map((edu, i) => (
              <button
                key={edu.id}
                onClick={() => setEduModal({ open: true, index: i })}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{edu.school}</p>
                  <p className="text-xs text-slate-500 truncate">{[edu.degree, edu.field].filter(Boolean).join(", ")}</p>
                </div>
                <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </Glass>

      <ExperienceModal
        open={expModal.open}
        initial={expModal.index !== null ? experience[expModal.index] : null}
        onClose={() => setExpModal({ open: false, index: null })}
        onSave={saveExperience}
        onDelete={removeExperience}
      />
      <EducationModal
        open={eduModal.open}
        initial={eduModal.index !== null ? education[eduModal.index] : null}
        onClose={() => setEduModal({ open: false, index: null })}
        onSave={saveEducation}
        onDelete={removeEducation}
      />
    </div>
  )
}

/* ---------------------------------------------------------------
   Targeting tab
----------------------------------------------------------------*/
function TargetingTab({ user, onSave }) {
  const [role, setRole] = useState(user.preferred_role || "")
  const [companies, setCompanies] = useState((user.target_companies || []).join(", "))
  const [industries, setIndustries] = useState((user.industries || []).join(", "))
  const [location, setLocation] = useState(user.location || "")
  const [compFloor, setCompFloor] = useState(user.comp_floor || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        preferred_role: role,
        location,
        target_companies: companies.split(",").map(s => s.trim()).filter(Boolean),
        industries: industries.split(",").map(s => s.trim()).filter(Boolean),
        comp_floor: compFloor ? Number(compFloor) : null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Target size={15} className="text-cyan-300" /> Pursuing
          </p>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            {saving && <><Loader2 size={11} className="animate-spin" /> Saving…</>}
            {saved && <><Check size={11} className="text-emerald-400" /> Saved</>}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Target role</label>
            <input className={inputStyle} value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <div>
            <label className={labelStyle}>Target companies</label>
            <input className={inputStyle} value={companies} onChange={e => setCompanies(e.target.value)} placeholder="Stripe, Google (comma separated)" />
          </div>
          <div>
            <label className={labelStyle}>Industries</label>
            <input className={inputStyle} value={industries} onChange={e => setIndustries(e.target.value)} placeholder="Fintech, SaaS" />
          </div>
          <div>
            <label className={labelStyle}>Location</label>
            <input className={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote / San Francisco" />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelStyle}>Minimum compensation ($/yr)</label>
          <input className={inputStyle} type="number" value={compFloor} onChange={e => setCompFloor(e.target.value)} placeholder="120000" />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 px-5 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400 transition-all disabled:opacity-50"
        >
          Save Targeting
        </button>
      </Glass>
    </div>
  )
}

/* ---------------------------------------------------------------
   Skills tab
----------------------------------------------------------------*/
function SkillsTab({ skills, onChange }) {
  const [modal, setModal] = useState({ open: false, index: null })

  const withIndex = skills.map((s, i) => ({ ...s, _i: i, category: s.category || "Other" }))
  const categories = [...new Set(withIndex.map(s => s.category))]
  const existingCategories = [...new Set(skills.map(s => s.category).filter(Boolean))]

  function handleSave(data) {
    const next = [...skills]
    if (modal.index === null) next.push(data)
    else next[modal.index] = data
    onChange(next)
    setModal({ open: false, index: null })
  }
  function handleDelete() {
    onChange(skills.filter((_, i) => i !== modal.index))
    setModal({ open: false, index: null })
  }

  return (
    <Glass className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Wrench size={15} className="text-cyan-300" /> Skills — {skills.length}
        </p>
        <button
          onClick={() => setModal({ open: true, index: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus size={12} /> Add skill
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No skills yet.</p>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {withIndex.filter(s => s.category === cat).map(s => (
                  <button
                    key={s._i}
                    onClick={() => setModal({ open: true, index: s._i })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SkillsModal
        open={modal.open}
        initial={modal.index !== null ? skills[modal.index] : null}
        existingCategories={existingCategories}
        onClose={() => setModal({ open: false, index: null })}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Glass>
  )
}

/* ---------------------------------------------------------------
   Main Profile page
----------------------------------------------------------------*/
export default function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const [active, setActive] = useState("overview")
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [exp, edu] = await Promise.all([getExperience(), getEducation()])
        setExperience(exp)
        setEducation(edu)
      } catch (err) {
        console.error("Failed to load profile data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleProfileSave(data) {
    const result = await updateProfile(data)
    dispatch(setUser({ ...user, ...result.user }))
  }

  async function handleSkillsChange(skills) {
    await handleProfileSave({ skills })
  }

  async function handleImportFromResume() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/pdf"
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      setImporting(true)
      try {
        const analysis = await analyzeResume(file)
        const extracted = analysis.extracted_content || {}

        // Merge extracted skills into profile
        if (extracted.skills?.length) {
          const existingNames = new Set((user.skills || []).map(s => s.name.toLowerCase()))
          const newSkills = extracted.skills.filter(s => !existingNames.has(s.name.toLowerCase()))
          await handleProfileSave({ skills: [...(user.skills || []), ...newSkills] })
        }

        // Create Experience records for each extracted role
        if (extracted.experience?.length) {
          const created = []
          for (const exp of extracted.experience) {
            const record = await createExperience(exp)
            created.push(record)
          }
          setExperience(prev => [...prev, ...created])
        }

        // Create Education records
        if (extracted.education?.length) {
          const created = []
          for (const edu of extracted.education) {
            const record = await createEducation(edu)
            created.push(record)
          }
          setEducation(prev => [...prev, ...created])
        }
      } catch (err) {
        console.error("Failed to import from resume:", err)
      } finally {
        setImporting(false)
      }
    }
    input.click()
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
      <div className="space-y-6 animate-fade-in max-w-[83.33%] ">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Your career memory. Everything every agent reads from.</p>
        </div>

        <div className="flex items-center gap-1 border-b border-white/[0.08]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold tracking-[0.1em] uppercase transition-all border-b-2 -mb-px ${
                active === t.id ? "text-white border-cyan-400" : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {active === "overview" && (
          <OverviewTab
            user={user}
            experience={experience}
            education={education}
            onExperienceChange={setExperience}
            onEducationChange={setEducation}
            onImportClick={handleImportFromResume}
            importing={importing}
          />
        )}
        {active === "targeting" && (
          <TargetingTab user={user} onSave={handleProfileSave} />
        )}
        {active === "skills" && (
          <SkillsTab skills={user.skills || []} onChange={handleSkillsChange} />
        )}
      </div>
    </MainLayout>
  )
}
// src/components/profile/OverviewTab.jsx
import { useState } from "react"
import {
  Briefcase, GraduationCap, Plus, Pencil, Loader2, UploadCloud
} from "lucide-react"
import {
  createExperience, updateExperience, deleteExperience,
  createEducation, updateEducation, deleteEducation
} from "../../services/profile.service.js"
import ExperienceModal from "../resume/ExperienceModal.jsx"
import EducationModal from "../resume/EducationModal.jsx"
import Glass from "./Glass.jsx"
import SnapshotBadge from "./SnapshotBadge.jsx"
import {
  GOAL_LABELS, SITUATION_LABELS, EXPERIENCE_LABELS, CRAFT_LABELS,
  WORK_MODE_LABELS, WORK_AUTH_LABELS, SEARCH_STATUS_LABELS,
  BLOCKER_LABELS, TIME_LABELS
} from "./constants.js"

export default function OverviewTab({ user, experience, education, onExperienceChange, onEducationChange, onImportClick, importing }) {
  const [expModal, setExpModal] = useState({ open: false, index: null })
  const [eduModal, setEduModal] = useState({ open: false, index: null })

  const checks = [
    { label: "Experience", done: experience.length > 0 },
    { label: "Skills evidenced", done: (user.skills || []).length > 0 },
    { label: "Goals set", done: !!(user.preferred_role || user.onboarding_goal) },
    { label: "Location set", done: !!user.location },
  ]
  const doneCount = checks.filter(c => c.done).length

  const snapshotBadges = [
    { label: "Goal", value: GOAL_LABELS[user.onboarding_goal] },
    { label: "Situation", value: SITUATION_LABELS[user.onboarding_situation] },
    { label: "Experience level", value: EXPERIENCE_LABELS[user.experience_level] },
    { label: "Craft", value: CRAFT_LABELS[user.craft] },
    { label: "Work mode", value: WORK_MODE_LABELS[user.work_mode] },
    { label: "Relocation", value: user.open_to_relocate ? "Open to relocating" : null },
    { label: "Work authorization", value: WORK_AUTH_LABELS[user.work_authorization] },
    { label: "Search status", value: SEARCH_STATUS_LABELS[user.search_status] },
    { label: "Biggest blocker", value: BLOCKER_LABELS[user.biggest_blocker] },
    { label: "Weekly time", value: TIME_LABELS[user.weekly_time_commitment] },
    { label: "GitHub", value: user.github_username ? `github.com/${user.github_username}` : null },
  ]
  const hasSnapshotData = snapshotBadges.some(b => b.value)

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

      {/* Onboarding snapshot */}
      <Glass className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">From onboarding</p>
        <h2 className="text-xl font-bold text-white mb-4">Your snapshot</h2>

        {hasSnapshotData ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {snapshotBadges.map(b => (
              <SnapshotBadge key={b.label} label={b.label} value={b.value} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nothing here yet — this fills in once you complete onboarding.
          </p>
        )}
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
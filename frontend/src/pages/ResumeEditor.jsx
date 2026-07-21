// src/pages/ResumeEditor.jsx
import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout.jsx"
import {
  getResumeById, createResume, updateResumeContent, generatePDF
} from "../services/resume.service.js"
import api from "../services/api.service.js"
import { API_URLS } from "../config/apiConfig.js"
import { ArrowLeft, Loader2, Download, Check } from "lucide-react"

import { emptyContent } from "../components/resume-editor/constants.js"
import FindingsChecklist from "../components/resume-editor/FindingsChecklist.jsx"
import PersonalSection from "../components/resume-editor/PersonalSection.jsx"
import SummarySection from "../components/resume-editor/SummarySection.jsx"
import EducationSection from "../components/resume-editor/EducationSection.jsx"
import ExperienceSection from "../components/resume-editor/ExperienceSection.jsx"
import ProjectsSection from "../components/resume-editor/ProjectsSection.jsx"
import SkillsSection from "../components/resume-editor/SkillsSection.jsx"
import Preview from "../components/resume-editor/Preview.jsx"

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
        } catch (err) {
          console.error("Failed to load resume:", err)
        } finally {
          setLoading(false)
        }
      } else {
        try {
          const res = await api.get("/auth/me")
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
      window.open(`${API_URLS.resumeAI}${url}`, "_blank")
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
import { useState, useEffect } from "react"
import MainLayout from "../components/layout/MainLayout.jsx"
import { useSelector, useDispatch } from "react-redux"
import { setUser } from "../store/slice/authSlice.js"
import { updateProfile, getExperience, createExperience, getEducation, createEducation } from "../services/profile.service.js"
import { analyzeResume } from "../services/resume.service.js"
import { Loader2 } from "lucide-react"
import OverviewTab from "../components/profile/OverviewTab.jsx"
import TargetingTab from "../components/profile/TargetingTab.jsx"
import SkillsTab from "../components/profile/SkillsTab.jsx"
import { TABS } from "../components/profile/constants.js"

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
      <div className="space-y-6 animate-fade-in max-w-[83.33%]">
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
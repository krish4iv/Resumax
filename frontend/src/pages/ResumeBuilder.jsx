import { useState } from 'react'
import MainLayout from '../components/layout/MainLayout.jsx'
import { theme } from '../theme/index.js'
import { summarizeBullets, generatePDF } from '../services/resume.service.js'
import { Loader2, Plus, X, FileText, Download, ChevronRight, ChevronLeft } from 'lucide-react'

const templates = [
  { id: 'classic',  label: 'Classic',  desc: 'Clean and traditional layout' },
  { id: 'modern',   label: 'Modern',   desc: 'Contemporary with color accents' },
  { id: 'creative', label: 'Creative', desc: 'Bold and eye-catching design' },
]

const inputStyle = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 ${theme.input}`

export default function ResumeBuilder() {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  // Form state
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [bullets, setBullets]   = useState('')
  const [summary, setSummary]   = useState('')
  const [generating, setGenerating] = useState(false)

  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills]         = useState([])
  const [projectName, setProjectName]   = useState('')
  const [projectDesc, setProjectDesc]   = useState('')
  const [projects, setProjects]         = useState([])

  const [template, setTemplate] = useState('classic')
  const [pdfUrl, setPdfUrl]     = useState(null)
  const [downloading, setDownloading] = useState(false)

  // Skills
  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }
  const removeSkill = (s) => setSkills(skills.filter(x => x !== s))

  // Projects
  const addProject = () => {
    if (!projectName.trim() || !projectDesc.trim()) return
    setProjects([...projects, { name: projectName.trim(), description: projectDesc.trim() }])
    setProjectName('')
    setProjectDesc('')
  }
  const removeProject = (i) => setProjects(projects.filter((_, idx) => idx !== i))

  // AI Summary
  const handleGenerateSummary = async () => {
    const bulletList = bullets.split('\n').filter(b => b.trim())
    if (!bulletList.length) return
    setGenerating(true)
    try {
      const generated = await summarizeBullets(bulletList)
      setSummary(generated)
    } catch (err) {
      console.error('Failed to generate summary:', err)
    } finally {
      setGenerating(false)
    }
  }

  // Generate PDF
  const handleGeneratePDF = async () => {
    setDownloading(true)
    try {
      const url = await generatePDF({ name, email, phone, summary, skills, projects, template })
      setPdfUrl(`http://localhost:8009${url}`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-semibold ${theme.heading}`}>Resume Builder</h1>
          <p className={theme.subtext}>Build your professional resume in 4 simple steps</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step
                  ? 'bg-linear-to-r from-blue-500 to-violet-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
        <p className={theme.subtext}>Step {step} of {totalSteps}</p>

        {/* Card */}
        <div className={theme.card}>

          {/* STEP 1 — Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className={`text-lg font-semibold ${theme.heading}`}>Personal Information</h2>
              <div>
                <label className={theme.label}>Full Name</label>
                <input className={inputStyle} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className={theme.label}>Email</label>
                <input className={inputStyle} type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className={theme.label}>Phone</label>
                <input className={inputStyle} type="tel" placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 2 — Summary */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className={`text-lg font-semibold ${theme.heading}`}>Professional Summary</h2>
              <div>
                <label className={theme.label}>Enter bullet points (one per line)</label>
                <textarea
                  className={`${inputStyle} h-32 resize-none`}
                  placeholder={"- 3 years experience in React\n- Built 5+ production apps\n- Strong problem solving skills"}
                  value={bullets}
                  onChange={e => setBullets(e.target.value)}
                />
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={generating || !bullets.trim()}
                className={`${theme.btnPrimary} flex items-center gap-2`}
              >
                {generating
                  ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                  : '✨ Generate with AI'
                }
              </button>
              {summary && (
                <div>
                  <label className={theme.label}>Generated Summary (edit if needed)</label>
                  <textarea
                    className={`${inputStyle} h-32 resize-none`}
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Skills & Projects */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${theme.heading}`}>Skills & Projects</h2>

              {/* Skills */}
              <div>
                <label className={theme.label}>Skills</label>
                <input
                  className={inputStyle}
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map(skill => (
                      <span key={skill} className={`${theme.badge} ${theme.badgeBlue} flex items-center gap-1.5`}>
                        {skill}
                        <button onClick={() => removeSkill(skill)}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects */}
              <div>
                <label className={theme.label}>Add Project</label>
                <div className="space-y-2">
                  <input
                    className={inputStyle}
                    placeholder="Project name"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                  />
                  <textarea
                    className={`${inputStyle} h-24 resize-none`}
                    placeholder="Project description"
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                  />
                  <button
                    onClick={addProject}
                    className={`${theme.btnGlass} flex items-center gap-2`}
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>

                {projects.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {projects.map((project, i) => (
                      <div key={i} className={`${theme.card} flex justify-between items-start`}>
                        <div>
                          <p className={`font-medium text-sm ${theme.heading}`}>{project.name}</p>
                          <p className={`text-xs mt-0.5 ${theme.subtext}`}>{project.description}</p>
                        </div>
                        <button onClick={() => removeProject(i)} className="text-red-400 hover:text-red-300">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 — Template & Download */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${theme.heading}`}>Choose Template</h2>

              <div className="grid grid-cols-3 gap-4">
                {templates.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center ${
                      template === t.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <FileText size={28} className={`mx-auto mb-2 ${template === t.id ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className={`font-medium text-sm ${theme.heading}`}>{t.label}</p>
                    <p className={`text-xs mt-1 ${theme.subtext}`}>{t.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGeneratePDF}
                disabled={downloading}
                className={`w-full ${theme.btnPrimary} flex items-center justify-center gap-2`}
              >
                {downloading
                  ? <><Loader2 size={14} className="animate-spin" /> Generating PDF...</>
                  : '📄 Generate PDF'
                }
              </button>

              {pdfUrl && (
                
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full ${theme.btnGlass} flex items-center justify-center gap-2`}
                >
                  <Download size={14} />
                  Download PDF
                </a>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className={`${theme.btnGlass} flex items-center gap-2 disabled:opacity-40`}
            >
              <ChevronLeft size={16} /> Back
            </button>
            {step < totalSteps && (
              <button
                onClick={() => setStep(s => s + 1)}
                className={`${theme.btnPrimary} flex items-center gap-2`}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  )
}
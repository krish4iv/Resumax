import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  ChevronLeft, ArrowRight, Check, Plus, Loader2,
  UploadCloud, File as FileIcon,
} from "lucide-react"
import api from "../services/api.service.js"
import { analyzeResume, createResume } from "../services/resume.service.js"
import { auth } from "../config/firebase.js"
import { setUser } from "../store/slice/authSlice.js"

/* ---------------------------------------------------------------
   Step definitions — data-driven so adding/reordering/removing a
   step is a one-object change, not a new component.

   All 14 steps below now match your real screenshots. The earlier
   "industries" placeholder step has been dropped entirely (no
   screenshot for it) — the field stays on the User model/backend
   in case you want it later, it's just not collected in this flow.
----------------------------------------------------------------*/

const GOAL_OPTIONS = [
  { value: "first_job", label: "Land my first job" },
  { value: "switch_company", label: "Switch to a better company" },
  { value: "level_up", label: "Level up, senior to staff" },
  { value: "big_tech", label: "Break into big tech" },
  { value: "exploring", label: "Just exploring for now" },
]

const SITUATION_OPTIONS = [
  { value: "employed_interviewing", label: "Employed, actively interviewing" },
  { value: "employed_looking", label: "Employed, casually looking" },
  { value: "searching_fulltime", label: "Searching full-time" },
  { value: "student_new_grad", label: "Student or new grad" },
  { value: "bootcamp", label: "Bootcamp or self-taught" },
  { value: "switching_into_tech", label: "Switching into tech" },
]

const EXPERIENCE_OPTIONS = [
  { value: "intern", label: "Intern" },
  { value: "new_grad", label: "New grad" },
  { value: "1_2_yrs", label: "1 to 2 yrs" },
  { value: "3_5_yrs", label: "3 to 5 yrs" },
  { value: "6_9_yrs", label: "6 to 9 yrs" },
  { value: "10_plus_yrs", label: "10+ yrs" },
]

const CRAFT_OPTIONS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full-stack" },
  { value: "mobile", label: "Mobile" },
  { value: "ml_ai", label: "ML / AI" },
  { value: "data", label: "Data" },
  { value: "devops", label: "DevOps / Platform" },
  { value: "security", label: "Security" },
  { value: "embedded", label: "Embedded" },
  { value: "qa_sdet", label: "QA / SDET" },
  { value: "engineering_manager", label: "Engineering manager" },
]

const TOOL_OPTIONS = [
  "TypeScript", "JavaScript", "Python", "Java", "Go", "Rust", "C++",
  "C#", "Ruby", "Swift", "Kotlin", "SQL", "React", "Node.js",
  "Next.js", "Vue", "Django", "Spring", "Kubernetes", "AWS",
  "PostgreSQL", "GraphQL",
]

const COMPANY_OPTIONS = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix",
  "Nvidia", "OpenAI", "Stripe", "Airbnb", "Databricks", "Anthropic",
]

const WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
]

const WORK_AUTH_OPTIONS = [
  { value: "citizen_or_pr", label: "No, citizen or permanent resident" },
  { value: "need_sponsorship_now", label: "Yes, I need sponsorship now" },
  { value: "need_sponsorship_later", label: "I will need it later" },
]

const SEARCH_STATUS_OPTIONS = [
  { value: "not_started", label: "Not started applying yet" },
  { value: "applying_no_response", label: "Applying, not hearing back" },
  { value: "interviewing_no_offers", label: "Interviewing, no offers yet" },
  { value: "have_offer", label: "I have an offer" },
]

const BLOCKER_OPTIONS = [
  { value: "resume_not_responding", label: "My resume is not getting responses" },
  { value: "cant_find_roles", label: "I cannot find good roles" },
  { value: "interview_performance", label: "I freeze or underperform in interviews" },
  { value: "feel_underqualified", label: "I feel underqualified" },
  { value: "no_time_to_apply", label: "I do not have time to apply" },
]

const TIME_OPTIONS = [
  { value: "few_hours", label: "A few hours" },
  { value: "5_to_15_hours", label: "5 to 15 hours" },
  { value: "15_plus_hours", label: "15+ hours" },
]

const STEPS = [
  {
    key: "onboarding_goal",
    type: "single",
    eyebrow: "YOUR GOAL",
    title: (name) => `${name}, what are you here to do?`,
    options: GOAL_OPTIONS,
  },
  {
    key: "onboarding_situation",
    type: "single",
    eyebrow: "YOUR SITUATION",
    title: (name) => `Where are you right now, ${name}?`,
    options: SITUATION_OPTIONS,
  },
  {
    key: "experience_level",
    type: "single-grid",
    eyebrow: "EXPERIENCE",
    title: () => "How much experience do you have?",
    options: EXPERIENCE_OPTIONS,
  },
  {
    key: "craft",
    type: "single-grid-2col",
    eyebrow: "YOUR CRAFT",
    title: () => "What do you build?",
    options: CRAFT_OPTIONS,
  },
  {
    key: "skills",
    type: "tags-multi",
    eyebrow: "YOUR STACK",
    title: () => "Pick your main tools.",
    subtitle: "Choose a few, you can refine later.",
    options: TOOL_OPTIONS,
  },
  {
    key: "target_companies",
    type: "companies",
    eyebrow: "TARGET COMPANIES",
    title: () => "Any companies you are aiming for?",
    subtitle: "Optional, but it sharpens your matches and interview prep.",
    options: COMPANY_OPTIONS,
    optional: true,
  },
  {
    key: "location", // combo step — writes work_mode, location, open_to_relocate together
    type: "location",
    eyebrow: "LOCATION",
    title: () => "Where do you want to work?",
  },
  {
    key: "work_authorization",
    type: "single",
    eyebrow: "WORK AUTHORIZATION",
    title: () => "Will you need visa sponsorship?",
    options: WORK_AUTH_OPTIONS,
  },
  {
    key: "comp_floor",
    type: "number",
    eyebrow: "COMPENSATION",
    title: () => "What total comp are you targeting?",
    subtitle: "Optional. It helps us filter out roles below your floor.",
    placeholder: "No minimum",
    optional: true,
    showSkip: true,
  },
  {
    key: "_interstitial_tailored_resume", // no field — informational only
    type: "interstitial",
    eyebrow: "DID YOU KNOW",
    title: () => null, // no h1 for this step — InterstitialStep renders the stat/copy itself
    stat: "1.6x",
    copy: "as many interviews go to tailored resumes over generic ones. Tailoring is step one for most people.",
  },
  {
    key: "search_status",
    type: "single",
    eyebrow: "YOUR SEARCH",
    title: () => "Where are you in the search?",
    options: SEARCH_STATUS_OPTIONS,
  },
  {
    key: "biggest_blocker",
    type: "single",
    eyebrow: "THE BLOCKER",
    title: (name) => `${name}, what is slowing you down most?`,
    options: BLOCKER_OPTIONS,
  },
  {
    key: "weekly_time_commitment",
    type: "single",
    eyebrow: "YOUR TIME",
    title: (name) => `${name}, how much time can you give this each week?`,
    options: TIME_OPTIONS,
  },
  {
    key: "github_username",
    type: "github",
    eyebrow: "GITHUB",
    title: () => "Want to add your GitHub?",
    subtitle: "Optional. Great for showing real work, especially early-career.",
    placeholder: "username",
    optional: true,
  },
  // --- final step, matches screenshot ---
  {
    key: "resume",
    type: "resume",
    eyebrow: "YOUR RESUME",
    title: (name) => `${name}, upload your resume so we can tailor everything to you.`,
    subtitle: "Stays private. We read it, we never share it.",
    optional: true,
  },
]

/* ---------------------------------------------------------------
   Shared bits
----------------------------------------------------------------*/
function OptionRow({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border px-6 py-5 text-left text-lg transition-all ${
        selected
          ? "border-cyan-400/50 bg-cyan-400/[0.07] text-white"
          : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      {label}
    </button>
  )
}

function OptionGrid({ options, selected, onSelect, cols = 3 }) {
  return (
    <div
      className={`grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`rounded-xl px-4 py-4 text-center transition-colors ${
            selected === opt.value
              ? "bg-cyan-400/15 text-white"
              : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function TagPicker({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              isSelected
                ? "border-cyan-400/60 bg-cyan-400/15 text-white"
                : "border-white/15 bg-white/[0.02] text-slate-300 hover:border-white/30 hover:text-white"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------
   Companies step — chips with a "+ add custom" input, mirrors
   TagPicker but with a free-text add affordance (screenshot 7)
----------------------------------------------------------------*/
function CompanyPicker({ options, selected, onToggle, onAddCustom }) {
  const [input, setInput] = useState("")

  function submitCustom(e) {
    if (e.key !== "Enter" || !input.trim()) return
    onAddCustom(input.trim())
    setInput("")
  }

  const customSelected = selected.filter((s) => !options.includes(s))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {[...options, ...customSelected].map((company) => {
          const isSelected = selected.includes(company)
          return (
            <button
              key={company}
              onClick={() => onToggle(company)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                isSelected
                  ? "border-cyan-400/60 bg-cyan-400/15 text-white"
                  : "border-white/15 bg-white/2 text-slate-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {company}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <Plus size={15} className="text-slate-500" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={submitCustom}
          placeholder="Add a company, press Enter"
          className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
        />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------
   Location step — work mode + free-text location + relocate toggle,
   all saved together under one "location" step key (screenshot).
----------------------------------------------------------------*/
function LocationStep({ answers, update, onContinue }) {
  const workMode = answers.work_mode
  const relocate = !!answers.open_to_relocate

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-slate-400">Where do you want to work?</p>
        <div className="grid grid-cols-3 gap-3">
          {WORK_MODE_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              selected={workMode === opt.value}
              onClick={() => update("work_mode", opt.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-slate-400">Where are you based?</p>
        <input
          value={answers.location || ""}
          onChange={(e) => update("location", e.target.value)}
          placeholder="e.g. Bengaluru, India"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-lg text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/40"
        />
      </div>

      <button
        onClick={() => update("open_to_relocate", !relocate)}
        className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${
          relocate
            ? "border-cyan-400/50 bg-cyan-400/[0.07] text-white"
            : "border-white/10 bg-white/[0.02] text-slate-300"
        }`}
      >
        <span>Open to relocating</span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
            relocate ? "border-cyan-400 bg-cyna-400 text-slate-950" : "border-white/20"
          }`}
        >
          {relocate && <Check size={13} />}
        </span>
      </button>

      <ContinueButton onClick={onContinue} />
    </div>
  )
}

/* ---------------------------------------------------------------
   Interstitial — informational stat card, no field to collect,
   just a Continue tap (screenshot: "1.6x as many interviews...")
----------------------------------------------------------------*/
function InterstitialStep({ stat, copy, onContinue }) {
  return (
    <div className="space-y-8">
      <p className="text-6xl font-bold text-cyan-300">{stat}</p>
      <p className="max-w-md text-lg text-slate-300">{copy}</p>
      <ContinueButton onClick={onContinue} />
    </div>
  )
}

/* ---------------------------------------------------------------
   Resume upload step — same analyze -> save pattern as AIReviewTab
----------------------------------------------------------------*/
function ResumeStep({ onDone, onSkip }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState("idle") // idle | analyzing | saving | error
  const [error, setError] = useState(null)

  function handleFiles(fileList) {
    const f = fileList?.[0]
    if (!f) return
    setFile(f)
    setError(null)
  }

  async function handleUpload() {
    if (!file) return
    setStatus("analyzing")
    setError(null)
    try {
      const analysis = await analyzeResume(file)
      setStatus("saving")
      await createResume({
        filename: file.name,
        content: analysis.extracted_content || {},
        ats_score: analysis.ats_score,
        content_quality: analysis.content_quality,
        ats_structure: analysis.ats_structure,
        job_optimization: analysis.job_optimization,
        writing_quality: analysis.writing_quality,
        app_ready: analysis.app_ready,
        strengths: analysis.strengths || [],
        findings: analysis.findings || [],
      })
      onDone()
    } catch (e) {
      setError(e.message || "Couldn't process that resume — try again or skip for now.")
      setStatus("idle")
    }
  }

  const busy = status === "analyzing" || status === "saving"

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!busy) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
          busy
            ? "cursor-not-allowed border-white/10 bg-white/[0.02]"
            : dragOver
            ? "border-cyan-400/60 bg-cyan-400/[0.06]"
            : "border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {file ? (
          <>
            <FileIcon size={28} className="text-cyan-300" />
            <p className="mt-3 text-white">{file.name}</p>
            <p className="mt-1 text-xs text-slate-500">click to replace</p>
          </>
        ) : (
          <>
            <UploadCloud size={28} className="text-slate-400" />
            <p className="mt-3 text-white">Drop your resume here, or click to choose</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">PDF, DOCX, or TXT</p>
          </>
        )}
      </div>

      {error && <p className="text-center text-sm text-cyan-300">{error}</p>}

      <div className="flex items-center justify-center gap-4">
        {file && (
          <button
            onClick={handleUpload}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {status === "analyzing" && "Analyzing…"}
            {status === "saving" && "Saving…"}
            {!busy && (
              <>
                Analyze & continue <ArrowRight size={15} />
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-center">
        <button onClick={onSkip} className="text-sm text-slate-500 underline hover:text-slate-300">
          I do not have one yet
        </button>
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------
   Main wizard
----------------------------------------------------------------*/
export default function OnboardingWizard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [started, setStarted] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [name, setName] = useState("there")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadName() {
      try {
        const token = await auth.currentUser.getIdToken()
        const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        const firstName = res.data.user?.name?.split(" ")[0]
        if (firstName) setName(firstName)
      } catch (err) {
        console.error("Failed to load user for onboarding:", err)
      }
    }
    loadName()
  }, [])

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1

  const update = useCallback((key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }, [])

  // The "skills" step collects a flat array of tool-name strings (from
  // TagPicker) because that's simplest for the picker UI. But the rest
  // of the app — SkillsTab, Skills modal, resume import — expects
  // skills as { name, category } objects. Convert only at persist time
  // so the wizard's own selection UI (string comparisons) stays simple.
  function toApiPayload(raw) {
    if (!raw.skills) return raw
    return {
      ...raw,
      skills: raw.skills.map((s) =>
        typeof s === "string" ? { name: s, category: "Other" } : s
      ),
    }
  }

  async function persist(payload) {
    setSaving(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const res = await api.put("/auth/onboarding", toApiPayload(payload), {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Backend returns the full updated user row — push it into Redux
      // immediately so Profile (and anywhere else reading state.auth.user)
      // reflects onboarding data without needing a refresh or re-login.
      if (res.data?.user) {
        dispatch(setUser(res.data.user))
      }
    } catch (err) {
      console.error("Failed to save onboarding progress:", err)
    } finally {
      setSaving(false)
    }
  }

  function goNext() {
    if (isLastStep) {
      persist(answers).then(() => navigate("/dashboard"))
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  function goBack() {
    if (stepIndex === 0) {
      setStarted(false)
    } else {
      setStepIndex((i) => i - 1)
    }
  }

  function handleSkipAll() {
    persist(answers).then(() => navigate("/dashboard"))
  }

  function handleSingleSelect(value) {
    update(step.key, value)
    setTimeout(goNext, 150) // brief pause so the selected state is visible before advancing
  }

  function handleTagToggle(field, value) {
    setAnswers((prev) => {
      const current = prev[field] || []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [field]: next }
    })
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] font-mono text-slate-200">
        <IntroHeader onSkip={handleSkipAll} />
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">LET'S BEGIN</p>
          <h1 className="mt-4 text-5xl font-bold text-white">Build your path to hired.</h1>
          <p className="mt-5 max-w-xl text-slate-400">
            A few quick questions, then you'll see the roles to target, what to fix first, and how
            long it should take. About 2 minutes, no account needed yet.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-9 inline-flex w-fit items-center gap-2 rounded-2xl bg-cyan-400 px-7 py-3.5 font-bold text-slate-950 transition-transform hover:scale-[1.03]"
          >
            Start <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  const selectedValue = answers[step.key]
  const selectedList = answers[step.key] || []

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-mono text-slate-200">
      <WizardHeader
        stepNumber={stepIndex + 1}
        total={STEPS.length}
        onBack={goBack}
        onSkip={handleSkipAll}
      />

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">{step.eyebrow}</p>
        {step.title && step.title(name) && (
          <h1 className="mt-4 text-4xl font-bold text-white">{step.title(name)}</h1>
        )}
        {step.subtitle && <p className="mt-3 text-slate-400">{step.subtitle}</p>}

        <div className="mt-9 space-y-6">
          {step.type === "single" && (
            <div className="space-y-3">
              {step.options.map((opt) => (
                <OptionRow
                  key={opt.value}
                  label={opt.label}
                  selected={selectedValue === opt.value}
                  onClick={() => handleSingleSelect(opt.value)}
                />
              ))}
            </div>
          )}

          {step.type === "single-grid" && (
            <OptionGrid options={step.options} selected={selectedValue} onSelect={handleSingleSelect} cols={3} />
          )}

          {step.type === "single-grid-2col" && (
            <div className="grid grid-cols-2 gap-3">
              {step.options.map((opt) => (
                <OptionRow
                  key={opt.value}
                  label={opt.label}
                  selected={selectedValue === opt.value}
                  onClick={() => handleSingleSelect(opt.value)}
                />
              ))}
            </div>
          )}

          {step.type === "tags-multi" && (
            <>
              <TagPicker
                options={step.options}
                selected={selectedList}
                onToggle={(v) => handleTagToggle(step.key, v)}
              />
              <p className="text-xs text-slate-500">{selectedList.length} selected</p>
              <ContinueButton onClick={goNext} />
            </>
          )}

          {step.type === "companies" && (
            <>
              <CompanyPicker
                options={step.options}
                selected={selectedList}
                onToggle={(v) => handleTagToggle(step.key, v)}
                onAddCustom={(v) => handleTagToggle(step.key, v)}
              />
              <div className="flex items-center justify-between pt-2">
                <button onClick={goNext} className="text-sm text-slate-500 underline hover:text-slate-300">
                  Skip
                </button>
                <ContinueButton onClick={goNext} />
              </div>
            </>
          )}

          {step.type === "location" && (
            <LocationStep answers={answers} update={update} onContinue={goNext} />
          )}

          {step.type === "interstitial" && (
            <InterstitialStep stat={step.stat} copy={step.copy} onContinue={goNext} />
          )}

          {step.type === "text" && (
            <>
              <input
                value={answers[step.key] || ""}
                onChange={(e) => update(step.key, e.target.value)}
                placeholder={step.placeholder}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-lg text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/40"
              />
              <ContinueButton onClick={goNext} />
            </>
          )}

          {step.type === "number" && (
            <>
              <input
                type="number"
                value={answers[step.key] || ""}
                onChange={(e) => update(step.key, e.target.value ? Number(e.target.value) : "")}
                placeholder={step.placeholder}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-lg text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/40"
              />
              <div className="flex items-center justify-between pt-2">
                {step.showSkip && (
                  <button onClick={goNext} className="text-sm text-slate-500 underline hover:text-slate-300">
                    Skip
                  </button>
                )}
                <ContinueButton onClick={goNext} />
              </div>
            </>
          )}

          {step.type === "github" && (
            <>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
                <span className="text-slate-500">github.com/</span>
                <input
                  value={answers[step.key] || ""}
                  onChange={(e) => update(step.key, e.target.value)}
                  placeholder={step.placeholder}
                  className="w-full bg-transparent text-lg text-white placeholder:text-slate-600 outline-none"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={goNext} className="text-sm text-slate-500 underline hover:text-slate-300">
                  Skip
                </button>
                <ContinueButton onClick={goNext} />
              </div>
            </>
          )}

          {step.type === "resume" && (
            <ResumeStep onDone={goNext} onSkip={goNext} />
          )}
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-slate-300 backdrop-blur">
          <Loader2 size={12} className="animate-spin" /> Saving…
        </div>
      )}
    </div>
  )
}

function ContinueButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.02]"
    >
      Continue <ArrowRight size={15} />
    </button>
  )
}

function IntroHeader({ onSkip }) {
  return (
    <div className="flex items-center justify-between px-8 py-5">
      <span className="text-sm font-bold tracking-wide text-white">
        resumax<span className="text-cyan-400">.</span>
      </span>
      <button onClick={onSkip} className="text-xs text-slate-500 hover:text-slate-300">
        Skip for now
      </button>
    </div>
  )
}

function WizardHeader({ stepNumber, total, onBack, onSkip }) {
  const progress = (stepNumber / total) * 100
  return (
    <div className="flex items-center gap-4 px-8 py-5">
      <button onClick={onBack} className="text-slate-500 hover:text-white">
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-bold tracking-wide text-white shrink-0">
        resumax<span className="text-cyan-400">.</span>
      </span>
      <div className="relative h-px flex-1 bg-white/10">
        <div
          className="absolute left-0 top-0 h-px bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tracking-widest text-slate-500">
        STEP {String(stepNumber).padStart(2, "0")} / {total}
      </span>
      <button onClick={onSkip} className="shrink-0 text-xs text-slate-500 hover:text-slate-300">
        Skip for now
      </button>
    </div>
  )
}   
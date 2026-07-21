// src/components/documents/constants.js
import { ShieldAlert, ShieldQuestion, ShieldCheck } from "lucide-react"

export const SEVERITY_STYLES = {
  high:   { icon: ShieldAlert,    color: "text-rose-300",    bg: "bg-rose-400/[0.08]",    border: "border-rose-400/20"    },
  medium: { icon: ShieldQuestion, color: "text-amber-300",   bg: "bg-amber-400/[0.08]",   border: "border-amber-400/20"   },
  low:    { icon: ShieldCheck,    color: "text-emerald-300", bg: "bg-emerald-400/[0.08]", border: "border-emerald-400/20" },
}

export const CATEGORY_LABELS = {
  content_quality: "Content Quality",
  ats_structure: "ATS Structure",
  job_optimization: "Job Optimization",
  writing_quality: "Writing Quality",
  app_ready: "App Ready",
}

export const CATEGORY_MAX = {
  content_quality: 40,
  ats_structure: 20,
  job_optimization: 25,
  writing_quality: 10,
  app_ready: 5,
}

export const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS)

export const TABS = [
  { id: "overview", label: "Overview" },
  { id: "resumes", label: "Resumes" },
  { id: "ai-review", label: "AI Review" },
]
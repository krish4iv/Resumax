// src/components/resume-editor/constants.js
import { ShieldAlert, ShieldQuestion, ShieldCheck } from "lucide-react"

export const SEVERITY_STYLES = {
  high:   { icon: ShieldAlert,    color: "text-rose-300",    bg: "bg-rose-400/[0.08]",    border: "border-rose-400/20"    },
  medium: { icon: ShieldQuestion, color: "text-amber-300",   bg: "bg-amber-400/[0.08]",   border: "border-amber-400/20"   },
  low:    { icon: ShieldCheck,    color: "text-emerald-300", bg: "bg-emerald-400/[0.08]", border: "border-emerald-400/20" },
}

/* ---------------------------------------------------------------
   Empty content shape
   NOTE the two shape changes from before:
   - personal.linkedin / personal.github -> personal.links: [{label, url}]
   - skills: string[] -> skills: [{ name, category }]
----------------------------------------------------------------*/
export const emptyContent = {
  personal: { name: "", email: "", phone: "", links: [] },
  summary: "",
  education: [],
  experience: [],  // { role, company, location, start_date, end_date, current, bullets[] }
  projects: [],    // { name, tech, links[], start_date, end_date, current, bullets[] }
  skills: [],      // { name, category }
}

export const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
export const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"
// src/components/profile/TargetingTab.jsx
import { useState } from "react"
import { Target, Loader2, Check } from "lucide-react"
import Glass from "./Glass.jsx"
import { inputStyle, labelStyle } from "./constants.js"

export default function TargetingTab({ user, onSave }) {
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
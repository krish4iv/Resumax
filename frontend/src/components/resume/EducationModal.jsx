import { useState, useEffect } from "react"
import { X, Trash2, Calendar } from "lucide-react"
import { createPortal } from "react-dom"

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

const emptyEducation = {
  school: "",
  degree: "",
  field: "",
  start_date: "",
  end_date: "",
  current: false,
}

export default function EducationModal({ open, initial, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(emptyEducation)

  useEffect(() => {
    if (open) setForm(initial ? { ...emptyEducation, ...initial } : emptyEducation)
  }, [open, initial])

  if (!open) return null

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSave() {
    if (!form.school.trim()) return
    onSave(form)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0a0a12] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0a0a12]">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-white">
            {initial ? "Edit Education" : "Add Education"}
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelStyle}>School *</label>
            <input className={inputStyle} value={form.school} onChange={e => update("school", e.target.value)} placeholder="University of Example" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Degree</label>
              <input className={inputStyle} value={form.degree} onChange={e => update("degree", e.target.value)} placeholder="Bachelor of Engineering" />
            </div>
            <div>
              <label className={labelStyle}>Field of Study</label>
              <input className={inputStyle} value={form.field} onChange={e => update("field", e.target.value)} placeholder="Information Technology" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Start Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className={`${inputStyle} pl-9`} value={form.start_date} onChange={e => update("start_date", e.target.value)} placeholder="Aug 2022" />
              </div>
            </div>
            <div>
              <label className={labelStyle}>End Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className={`${inputStyle} pl-9`}
                  value={form.current ? "" : form.end_date}
                  disabled={form.current}
                  onChange={e => update("end_date", e.target.value)}
                  placeholder="May 2026"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.current}
              onChange={e => update("current", e.target.checked)}
              className="w-4 h-4 rounded accent-cyan-400"
            />
            I'm currently studying here
          </label>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#0a0a12]">
          {initial ? (
            <button onClick={onDelete} className="flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-300">
              <Trash2 size={14} /> Delete
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.school.trim()}
              className="px-5 py-2 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400 transition-all disabled:opacity-40"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
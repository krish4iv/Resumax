import { useState, useEffect } from "react"
import { X, Plus, Trash2, Link2 } from "lucide-react"
import { createPortal } from "react-dom"

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

const LINK_TYPES = ["LinkedIn", "GitHub", "Portfolio", "Twitter", "Website", "Other"]

const emptyPersonal = {
  name: "",
  email: "",
  phone: "",
  links: [],
}

export default function PersonalInfoModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(emptyPersonal)

  useEffect(() => {
    if (open) setForm(initial ? { ...emptyPersonal, ...initial, links: initial.links || [] } : emptyPersonal)
  }, [open, initial])

  if (!open) return null

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addLink() {
    setForm(f => ({ ...f, links: [...f.links, { label: "LinkedIn", url: "" }] }))
  }
  function updateLink(i, field, value) {
    const links = [...form.links]
    links[i] = { ...links[i], [field]: value }
    setForm(f => ({ ...f, links }))
  }
  function removeLink(i) {
    setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    onSave({ ...form, links: form.links.filter(l => l.url.trim()) })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0a0a12] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0a0a12]">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-white">Edit Personal Info</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelStyle}>Full Name *</label>
            <input className={inputStyle} value={form.name} onChange={e => update("name", e.target.value)} placeholder="John Doe" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Email</label>
              <input className={inputStyle} value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" />
            </div>
            <div>
              <label className={labelStyle}>Phone</label>
              <input className={inputStyle} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 234 567 8900" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelStyle}>Links</label>
              <button
                onClick={addLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Plus size={12} /> Add Link
              </button>
            </div>

            {form.links.length > 0 ? (
              <div className="space-y-2">
                {form.links.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={l.label}
                      onChange={e => updateLink(i, "label", e.target.value)}
                      className={`${inputStyle} w-32 appearance-none cursor-pointer`}
                    >
                      {LINK_TYPES.map(t => (
                        <option key={t} value={t} className="bg-slate-900">{t}</option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Link2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        className={`${inputStyle} pl-9`}
                        value={l.url}
                        onChange={e => updateLink(i, "url", e.target.value)}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <button onClick={() => removeLink(i)} className="text-slate-500 hover:text-rose-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No links yet — add LinkedIn, GitHub, a portfolio, and more.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.08] bg-[#0a0a12]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="px-5 py-2 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400 transition-all disabled:opacity-40"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
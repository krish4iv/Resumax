import { useState, useEffect } from "react"
import { rewriteBullet } from "../../services/resume.service.js"
import { X, Plus, Trash2, Sparkles, Loader2, Calendar, Link2, Check } from "lucide-react"
import { createPortal } from "react-dom"


const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

const LINK_TYPES = ["Demo", "GitHub", "LeetCode", "Other"]

const emptyProject = {
  name: "",
  tech: "",
  links: [],
  start_date: "",
  end_date: "",
  current: false,
  bullets: [""],
}

export default function ProjectModal({ open, initial, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(emptyProject)
  const [rewritingIndex, setRewritingIndex] = useState(null)
  const [pendingRewrites, setPendingRewrites] = useState({})

  useEffect(() => {
    if (open) setForm(initial ? { ...emptyProject, ...initial } : emptyProject)
  }, [open, initial])

  if (!open) return null

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addLink() {
    setForm(f => ({ ...f, links: [...f.links, { label: "Demo", url: "" }] }))
  }
  function updateLink(i, field, value) {
    const links = [...form.links]
    links[i] = { ...links[i], [field]: value }
    setForm(f => ({ ...f, links }))
  }
  function removeLink(i) {
    setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
  }

  function updateBullet(i, value) {
    const bullets = [...form.bullets]
    bullets[i] = value
    setForm(f => ({ ...f, bullets }))
  }
  function addBullet() {
    setForm(f => ({ ...f, bullets: [...f.bullets, ""] }))
  }
  function removeBullet(i) {
    setForm(f => ({ ...f, bullets: f.bullets.filter((_, idx) => idx !== i) }))
  }

  async function handleOptimize(i) {
  const text = form.bullets[i]
  if (!text?.trim()) return
  setRewritingIndex(i)
  try {
    const result = await rewriteBullet(text)
    setPendingRewrites(prev => ({ ...prev, [i]: result.rewritten }))
  } catch (err) {
    console.error("Failed to optimize bullet:", err)
  } finally {
    setRewritingIndex(null)
  }
}

function acceptRewrite(i) {
  updateBullet(i, pendingRewrites[i])
  setPendingRewrites(prev => {
    const next = { ...prev }
    delete next[i]
    return next
  })
}

function dismissRewrite(i) {
  setPendingRewrites(prev => {
    const next = { ...prev }
    delete next[i]
    return next
  })
}

  function handleSave() {
    if (!form.name.trim()) return
    onSave({
      ...form,
      bullets: form.bullets.filter(b => b.trim()),
      links: form.links.filter(l => l.url.trim()),
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0a0a12] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0a0a12]">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-white">
            {initial ? "Edit Project" : "Add Project"}
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelStyle}>Project Name *</label>
            <input className={inputStyle} value={form.name} onChange={e => update("name", e.target.value)} placeholder="E-Commerce Platform" />
          </div>

          <div>
            <label className={labelStyle}>Technologies</label>
            <input className={inputStyle} value={form.tech} onChange={e => update("tech", e.target.value)} placeholder="React, Node.js, PostgreSQL" />
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
            {form.links.length > 0 && (
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
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                    <button onClick={() => removeLink(i)} className="text-slate-500 hover:text-rose-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Start Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className={`${inputStyle} pl-9`} value={form.start_date} onChange={e => update("start_date", e.target.value)} placeholder="Jan 2025" />
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
                  placeholder="Feb 2025"
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
            Currently working on this project
          </label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelStyle}>Project Description</label>
              <button
                onClick={addBullet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Plus size={12} /> Add Bullet
              </button>
            </div>

            <div className="space-y-3">
              {form.bullets.map((b, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-3">
                    <div className="flex items-start justify-between gap-2">
                    <textarea
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none resize-none"
                        rows={2}
                        value={b}
                        onChange={e => updateBullet(i, e.target.value)}
                        placeholder="Describe an achievement or responsibility..."
                    />
                    <button onClick={() => removeBullet(i)} className="text-slate-500 hover:text-rose-400 shrink-0">
                        <Trash2 size={14} />
                    </button>
                    </div>

                    {/* Pending AI rewrite — shown side-by-side until accepted/dismissed */}
                    {pendingRewrites[i] && (
                    <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] p-3 space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">AI suggestion</p>
                        <p className="text-sm text-cyan-100 leading-relaxed">{pendingRewrites[i]}</p>
                        <div className="flex items-center gap-2">
                        <button
                            onClick={() => acceptRewrite(i)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all"
                        >
                            <Check size={12} /> Use this
                        </button>
                        <button
                            onClick={() => dismissRewrite(i)}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
                        >
                            Keep original
                        </button>
                        </div>
                    </div>
                    )}

                    <div className="flex justify-end mt-2">
                    <button
                        onClick={() => handleOptimize(i)}
                        disabled={rewritingIndex === i || !b.trim() || !!pendingRewrites[i]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/20 text-pink-300 text-xs font-semibold hover:bg-pink-500/25 transition-all disabled:opacity-40"
                    >
                        {rewritingIndex === i ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {rewritingIndex === i ? "Optimizing…" : "Optimize Bullet"}
                    </button>
                    </div>
                </div>
                ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-white/8 bg-[#0a0a12]">
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
              disabled={!form.name.trim()}
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
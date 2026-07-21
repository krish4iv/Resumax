import { useState, useEffect } from "react"
import { X, Sparkles, Loader2, Check } from "lucide-react"
import { createPortal } from "react-dom"
import { rewriteBullet } from "../../services/resume.service.js"

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

export default function SummaryModal({ open, initial, onClose, onSave }) {
  const [summary, setSummary] = useState("")
  const [rewriting, setRewriting] = useState(false)
  const [pendingRewrite, setPendingRewrite] = useState(null)

  useEffect(() => {
    if (open) {
      setSummary(initial || "")
      setPendingRewrite(null)
    }
  }, [open, initial])

  if (!open) return null

  async function handleRewrite() {
    if (!summary.trim()) return
    setRewriting(true)
    try {
    
      const result = await rewriteBullet(summary)
      setPendingRewrite(result.rewritten)
    } catch (err) {
      console.error("Failed to rewrite summary:", err)
    } finally {
      setRewriting(false)
    }
  }

  function acceptRewrite() {
    setSummary(pendingRewrite)
    setPendingRewrite(null)
  }

  function dismissRewrite() {
    setPendingRewrite(null)
  }

  function handleSave() {
    onSave(summary)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-white/[0.1] bg-[#0a0a12] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-white">Edit Summary</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div>
            <label className={labelStyle}>Professional Summary</label>
            <textarea
              className={`${inputStyle} h-40 resize-none`}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="A brief professional summary..."
              autoFocus
            />
            <p className="mt-1.5 text-[11px] text-slate-500">{summary.length} characters</p>
          </div>

          {/* Pending AI rewrite — shown until accepted/dismissed */}
          {pendingRewrite && (
            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-cyan-300">AI suggestion</p>
              <p className="text-sm text-cyan-100 leading-relaxed">{pendingRewrite}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={acceptRewrite}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all"
                >
                  <Check size={12} /> Use this
                </button>
                <button
                  onClick={dismissRewrite}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
                >
                  Keep original
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleRewrite}
              disabled={rewriting || !summary.trim() || !!pendingRewrite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/20 text-pink-300 text-xs font-semibold hover:bg-pink-500/25 transition-all disabled:opacity-40"
            >
              {rewriting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {rewriting ? "Rewriting…" : "Rewrite with AI"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.08]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
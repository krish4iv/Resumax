import { useState, useEffect } from "react"
import { X, Trash2, Check } from "lucide-react"
import { createPortal } from "react-dom"

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

const emptySkill = { name: "", category: "" }

// existingCategories: string[] — derive this in the parent from the
// current skills list (e.g. [...new Set(skills.map(s => s.category))])
// so newly-added categories are available the next time this opens.
export default function SkillsModal({ open, initial, existingCategories = [], onClose, onSave, onDelete }) {
  const [form, setForm] = useState(emptySkill)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptySkill, ...initial } : { ...emptySkill, category: existingCategories[0] || "" })
      setCreatingCategory(false)
      setNewCategory("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  if (!open) return null

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleCategorySelect(value) {
    if (value === "__new__") {
      setCreatingCategory(true)
    } else {
      update("category", value)
    }
  }

  function confirmNewCategory() {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    update("category", trimmed)
    setCreatingCategory(false)
    setNewCategory("")
  }

  function handleSave() {
    if (!form.name.trim() || !form.category.trim()) return
    onSave(form)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0a12] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <p className="text-sm font-bold tracking-[0.15em] uppercase text-white">
            {initial ? "Edit Skill" : "Add Skill"}
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={labelStyle}>Skill *</label>
            <input
              className={inputStyle}
              value={form.name}
              onChange={e => update("name", e.target.value)}
              placeholder="React"
              autoFocus
            />
          </div>

          <div>
            <label className={labelStyle}>Category *</label>

            {!creatingCategory ? (
              <select
                value={existingCategories.includes(form.category) ? form.category : ""}
                onChange={e => handleCategorySelect(e.target.value)}
                className={`${inputStyle} appearance-none cursor-pointer`}
              >
                <option value="" disabled className="bg-slate-900">Select a category</option>
                {existingCategories.map(c => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
                <option value="__new__" className="bg-slate-900">+ Add new category</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  className={inputStyle}
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && confirmNewCategory()}
                  placeholder="e.g. Frontend, Databases, Tools"
                  autoFocus
                />
                <button
                  onClick={confirmNewCategory}
                  className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 shrink-0"
                  title="Confirm category"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => { setCreatingCategory(false); setNewCategory("") }}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white shrink-0"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {!creatingCategory && form.category && !existingCategories.includes(form.category) && (
              <p className="mt-1.5 text-xs text-cyan-300">New category: {form.category}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08]">
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
              disabled={!form.name.trim() || !form.category.trim()}
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
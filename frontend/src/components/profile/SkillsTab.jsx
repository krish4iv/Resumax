// src/components/profile/SkillsTab.jsx
import { useState } from "react"
import { Wrench, Plus } from "lucide-react"
import SkillsModal from "../resume/SkillsModal.jsx"
import Glass from "./Glass.jsx"

export default function SkillsTab({ skills, onChange }) {
  const [modal, setModal] = useState({ open: false, index: null })

  const withIndex = skills.map((s, i) => ({ ...s, _i: i, category: s.category || "Other" }))
  const categories = [...new Set(withIndex.map(s => s.category))]
  const existingCategories = [...new Set(skills.map(s => s.category).filter(Boolean))]

  function handleSave(data) {
    const next = [...skills]
    if (modal.index === null) next.push(data)
    else next[modal.index] = data
    onChange(next)
    setModal({ open: false, index: null })
  }
  function handleDelete() {
    onChange(skills.filter((_, i) => i !== modal.index))
    setModal({ open: false, index: null })
  }

  return (
    <Glass className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Wrench size={15} className="text-cyan-300" /> Skills — {skills.length}
        </p>
        <button
          onClick={() => setModal({ open: true, index: null })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus size={12} /> Add skill
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No skills yet.</p>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {withIndex.filter(s => s.category === cat).map(s => (
                  <button
                    key={s._i}
                    onClick={() => setModal({ open: true, index: s._i })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SkillsModal
        open={modal.open}
        initial={modal.index !== null ? skills[modal.index] : null}
        existingCategories={existingCategories}
        onClose={() => setModal({ open: false, index: null })}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Glass>
  )
}
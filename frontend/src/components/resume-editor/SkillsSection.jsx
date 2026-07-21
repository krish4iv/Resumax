// src/components/resume-editor/SkillsSection.jsx
import { useState } from "react"
import { Wrench, Plus } from "lucide-react"
import SkillsModal from "../resume/SkillsModal.jsx"
import Section from "./Section.jsx"

/* ---------------------------------------------------------------
   Skills — now category-grouped, modal-based add/edit
----------------------------------------------------------------*/
export default function SkillsSection({ skills, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  // attach original index so edit/delete target the right entry after grouping
  const withIndex = skills.map((s, i) => ({ ...s, _i: i, category: s.category || "Other" }))
  const categories = [...new Set(withIndex.map(s => s.category))]
  const existingCategories = [...new Set(skills.map(s => s.category).filter(Boolean))]

  function openAdd() {
    setEditIndex(null)
    setModalOpen(true)
  }
  function openEdit(i) {
    setEditIndex(i)
    setModalOpen(true)
  }
  function handleSave(data) {
    const next = [...skills]
    if (editIndex === null) next.push(data)
    else next[editIndex] = data
    onChange(next)
    setModalOpen(false)
  }
  function handleDelete() {
    onChange(skills.filter((_, idx) => idx !== editIndex))
    setModalOpen(false)
  }

  return (
    <Section icon={Wrench} title="Skills" count={skills.length}>
      {categories.length > 0 ? (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {withIndex.filter(s => s.category === cat).map(s => (
                  <button
                    key={s._i}
                    onClick={() => openEdit(s._i)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">No skills yet.</p>
      )}

      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add skill
      </button>

      <SkillsModal
        open={modalOpen}
        initial={editIndex !== null ? skills[editIndex] : null}
        existingCategories={existingCategories}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}
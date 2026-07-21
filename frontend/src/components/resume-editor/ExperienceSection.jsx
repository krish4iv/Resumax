// src/components/resume-editor/ExperienceSection.jsx
import { useState } from "react"
import { Briefcase, Pencil, Plus } from "lucide-react"
import ExperienceModal from "../resume/ExperienceModal.jsx"
import Section from "./Section.jsx"

/* ---------------------------------------------------------------
   Experience — unchanged, still uses ExperienceModal (has AI rewrite)
----------------------------------------------------------------*/
export default function ExperienceSection({ items, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  function openAdd() {
    setEditIndex(null)
    setModalOpen(true)
  }
  function openEdit(i) {
    setEditIndex(i)
    setModalOpen(true)
  }
  function handleSave(data) {
    const next = [...items]
    if (editIndex === null) next.push(data)
    else next[editIndex] = data
    onChange(next)
    setModalOpen(false)
  }
  function handleDelete() {
    onChange(items.filter((_, idx) => idx !== editIndex))
    setModalOpen(false)
  }

  return (
    <Section icon={Briefcase} title="Experience" count={items.length}>
      {items.map((exp, i) => (
        <button
          key={i}
          onClick={() => openEdit(i)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{exp.role || "Untitled role"}</p>
            <p className="text-xs text-slate-500 truncate">{exp.company} {exp.location ? `· ${exp.location}` : ""}</p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
        </button>
      ))}
      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add experience
      </button>

      <ExperienceModal
        open={modalOpen}
        initial={editIndex !== null ? items[editIndex] : null}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}
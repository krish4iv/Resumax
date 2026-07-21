// src/components/resume-editor/ProjectsSection.jsx
import { useState } from "react"
import { FolderGit2, Pencil, Plus } from "lucide-react"
import ProjectModal from "../resume/ProjectModal.jsx"
import Section from "./Section.jsx"

/* ---------------------------------------------------------------
   Projects — unchanged, still uses ProjectModal (has AI rewrite)
----------------------------------------------------------------*/
export default function ProjectsSection({ items, onChange }) {
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
    <Section icon={FolderGit2} title="Projects" count={items.length}>
      {items.map((p, i) => (
        <button
          key={i}
          onClick={() => openEdit(i)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{p.name || "Untitled project"}</p>
            <p className="text-xs text-slate-500 truncate">{p.tech || "No tech listed"}</p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 ml-2" />
        </button>
      ))}
      <button onClick={openAdd} className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200">
        <Plus size={13} /> Add project
      </button>

      <ProjectModal
        open={modalOpen}
        initial={editIndex !== null ? items[editIndex] : null}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </Section>
  )
}
// src/components/resume-editor/PersonalSection.jsx
import { useState } from "react"
import { User, Pencil } from "lucide-react"
import PersonalInfoModal from "../resume/PersonalInfoModal.jsx"
import Section from "./Section.jsx"

/* ---------------------------------------------------------------
   Personal Info — display card + edit modal (with links)
----------------------------------------------------------------*/
export default function PersonalSection({ personal, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const links = personal.links || []

  return (
    <Section icon={User} title="Personal Info">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full text-left rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all p-3.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{personal.name || "Your Name"}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {[personal.email, personal.phone].filter(Boolean).join(" · ") || "No contact info yet"}
            </p>
          </div>
          <Pencil size={13} className="text-slate-500 shrink-0 mt-0.5" />
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {links.map((l, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {l.label}
              </span>
            ))}
          </div>
        )}
      </button>

      <PersonalInfoModal
        open={modalOpen}
        initial={personal}
        onClose={() => setModalOpen(false)}
        onSave={data => { onChange(data); setModalOpen(false) }}
      />
    </Section>
  )
}
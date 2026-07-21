// src/components/resume-editor/SummarySection.jsx
import { useState } from "react"
import { Sparkles, Pencil } from "lucide-react"
import SummaryModal from "../resume/SummaryModal.jsx"
import Section from "./Section.jsx"

/* ---------------------------------------------------------------
   Summary — display card + edit modal (no AI, plain text edit)
----------------------------------------------------------------*/
export default function SummarySection({ summary, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Section icon={Sparkles} title="Summary">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full text-left rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all p-3.5 flex items-start justify-between gap-2"
      >
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
          {summary || "No summary yet — click to add one."}
        </p>
        <Pencil size={13} className="text-slate-500 shrink-0 mt-0.5" />
      </button>

      <SummaryModal
        open={modalOpen}
        initial={summary}
        onClose={() => setModalOpen(false)}
        onSave={text => { onChange(text); setModalOpen(false) }}
      />
    </Section>
  )
}
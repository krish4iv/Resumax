import { useState } from "react"
import MainLayout from "../components/layout/MainLayout.jsx"
import CompanyPicker from "../components/interview/CompanyPicker.jsx"
import CodingChecklist from "../components/interview/CodingChecklist.jsx"
import { Lock } from "lucide-react"

const SECTIONS = [
  { id: "myplan", label: "My Plan" },
  { id: "coding", label: "Coding" },
  { id: "system-design", label: "System Design" },
  { id: "behavioral", label: "Behavioral" },
]

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-24 text-center">
      <Lock size={28} className="mb-3 text-slate-600" />
      <p className="text-sm font-medium text-white">{label} is coming soon</p>
      <p className="mt-1 text-xs text-slate-500">We're wiring this module up next.</p>
    </div>
  )
}

export default function Interview() {
  const [section, setSection] = useState("myplan")
  const [selectedCompany, setSelectedCompany] = useState(null)

  return (
    <MainLayout>
      <div className="max-w-7xl animate-fade-in space-y-6">
        <div className="flex items-center gap-1 border-b border-white/[0.08]">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
                section === s.id
                  ? "border-cyan-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "myplan" && (
          <CompanyPicker selectedCompany={selectedCompany} onSelectCompany={setSelectedCompany} />
        )}
        {section === "coding" && <CodingChecklist selectedCompany={selectedCompany} />}
        {section === "system-design" && <ComingSoon label="System Design" />}
        {section === "behavioral" && <ComingSoon label="Behavioral" />}
      </div>
    </MainLayout>
  )
}
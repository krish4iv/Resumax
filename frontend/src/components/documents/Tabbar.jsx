// src/components/documents/TabBar.jsx
import Glass from "./Glass.jsx"
import { TABS } from "./constants.js"

export default function TabBar({ active, onChange }) {
  return (
    <Glass className="inline-flex items-center gap-1 rounded-full p-1.5">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            active === t.id ? "bg-white text-black" : "text-slate-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {t.label}
        </button>
      ))}
    </Glass>
  )
}
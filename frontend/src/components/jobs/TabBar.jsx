const TABS = [
  { value: 'browse',   label: 'Browse'   },
  { value: 'foryou',   label: 'For You'  },
  { value: 'pipeline', label: 'Pipeline' },
]

const TabBar = ({ activeTab, onChange }) => (
  <div className="flex items-center gap-1 border-b border-white/[0.08]">
    {TABS.map(t => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={`px-4 py-2.5 text-xs font-semibold tracking-[0.1em] uppercase transition-all border-b-2 -mb-px ${
          activeTab === t.value
            ? 'text-white border-cyan-400'
            : 'text-slate-500 border-transparent hover:text-slate-300'
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
)

export default TabBar
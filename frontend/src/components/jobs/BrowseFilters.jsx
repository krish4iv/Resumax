import { Search, MapPin, DollarSign, ChevronDown, X } from 'lucide-react'

const jobTypes = [
  { value: '',           label: 'Any level'  },
  { value: 'full-time',  label: 'Full Time'  },
  { value: 'part-time',  label: 'Part Time'  },
  { value: 'contract',   label: 'Contract'   },
  { value: 'internship', label: 'Internship' },
]

const modeOptions = [
  { value: '',        label: 'Anywhere' },
  { value: 'remote',  label: 'Remote'   },
  { value: 'on-site', label: 'On-site'  },
]

const BrowseFilters = ({ filters, setters, hasFilters, onClear }) => {
  const { search, location, mode, jobType, salary } = filters
  const { setSearch, setLocation, setMode, setJobType, setSalary } = setters

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title or keyword"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <div className="relative md:w-56">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          {modeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === opt.value ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white cursor-pointer focus:outline-none focus:border-cyan-400/40"
          >
            {jobTypes.map(({ value, label }) => (
              <option key={value} value={value} className="bg-slate-900">{label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <div className="relative w-36">
          <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Min salary"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

export default BrowseFilters
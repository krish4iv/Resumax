import { useEffect, useState } from 'react'
import MainLayout from '../components/layout/MainLayout.jsx'
import { auth } from '../config/firebase.js'
import api from '../services/api.service.js'
import { theme } from '../theme/index.js'
import {
  Search, MapPin, Building2, Clock,
  Briefcase, SlidersHorizontal, Loader2, X
} from 'lucide-react'
import JobRecommendations from '../components/JobRecommendations.jsx'

const jobTypes = [
  { value: '',           label: 'All Types'  },
  { value: 'full-time',  label: 'Full Time'  },
  { value: 'part-time',  label: 'Part Time'  },
  { value: 'contract',   label: 'Contract'   },
  { value: 'remote',     label: 'Remote'     },
  { value: 'internship', label: 'Internship' },
]

const Jobs = () => {
  const [search, setSearch]   = useState('')
  const [jobType, setJobType] = useState('')
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)

  const fetchJobs = async (searchVal = search, typeVal = jobType) => {
    try {
      setLoading(true)
      if (!auth.currentUser) return
      const token = await auth.currentUser.getIdToken()
      const params = new URLSearchParams()
      if (searchVal) params.append('search', searchVal)
      if (typeVal)   params.append('job_type', typeVal)

      const response = await api.get(`/jobs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setJobs(response.data)
      setTotal(response.data.length)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 500)
    return () => clearTimeout(timer)
  }, [search, jobType])

  const clearFilters = () => {
    setSearch('')
    setJobType('')
  }

  const hasFilters = search || jobType

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-semibold ${theme.heading}`}>
            Browse Jobs
          </h1>
          <p className={theme.subtext}>
            {total} {total === 1 ? 'job' : 'jobs'} available
          </p>
        </div>

        {/* Filters */}
        <div className={`${theme.card} flex flex-col md:flex-row gap-3`}>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              className={`${theme.input} pl-10`}
            />
          </div>

          {/* Job Type */}
          <div className="relative md:w-48">
            <SlidersHorizontal size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className={`${theme.input} pl-10 appearance-none cursor-pointer`}
            >
              {jobTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className={`${theme.btnGlass} flex items-center gap-2 whitespace-nowrap`}
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className={`${theme.card} text-center py-16`}>
            <Briefcase size={44} className="mx-auto text-slate-400 mb-3" />
            <p className={`font-medium ${theme.heading}`}>No jobs found</p>
            <p className={`${theme.subtext} mt-1`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className={theme.cardHover}>

                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${theme.heading} leading-tight`}>
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <Building2 size={13} />
                      {job.company}
                    </div>
                  </div>
                  {job.job_type && (
                    <span className={`${theme.badge} ${theme.badgeBlue} ml-2 shrink-0`}>
                      {job.job_type}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      💰 {job.salary}
                    </span>
                  )}
                </div>

                {/* Description preview */}
                {job.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {job.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  {job.posted_at ? (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} />
                      {new Date(job.posted_at).toLocaleDateString()}
                    </span>
                  ) : <span />}

                  {job.source_url && (
                    
                      <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs ${theme.btnPrimary} py-1.5 px-3`}
                    >
                      Apply →
                    </a>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </MainLayout>
  )
}

export default Jobs
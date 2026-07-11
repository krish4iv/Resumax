import { useEffect, useState, useCallback } from 'react'
import MainLayout from '../components/layout/MainLayout.jsx'
import jobsScraperService from '../services/jobs.service.js'
import {
  Search, MapPin, Building2, Clock,
  Briefcase, Loader2, X, DollarSign, Bookmark,
  ExternalLink, Target, ChevronDown, ChevronRight, Sparkles,
  CheckCircle2
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { saveJob } from '../services/saveJobs.service.js'
import { getApplications, createApplication } from '../services/application.service.js'

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

const TABS = [
  { value: 'browse',  label: 'Browse'    },
  { value: 'foryou',  label: 'For You'   },
  { value: 'pipeline',label: 'Pipeline'  },
]

// jobspy's raw job -> the shape every card/detail-panel in this page expects
function mapScrapedJob(job, i) {
  return {
    id: job.id || `${job.job_url || i}`,
    title: job.title,
    company: job.company,
    location: job.location,
    job_type: job.job_type,
    salary: job.min_amount
      ? `${job.min_amount}${job.max_amount ? ` - ${job.max_amount}` : ''}`
      : null,
    description: job.description,
    posted_at: job.date_posted,
    source_url: job.job_url,
    match_score: null,
    _min_amount: job.min_amount,
  }
}

// the recommend_jobs API returns a lighter shape — normalize it the same way
function mapRecommendedJob(job, i) {
  return {
    id: job.id || `rec-${i}`,
    title: job.title,
    company: job.company,
    location: job.location,
    job_type: null,
    salary: null,
    description: job.description,
    posted_at: null,
    source_url: job.url,
    match_score: job.match_score ?? null,
  }
}

const Jobs = () => {
  const { user } = useSelector((state) => state.auth)
  const uid = user?.firebase_uid

  const [activeTab, setActiveTab] = useState('browse')

  // ---- Browse tab state (unchanged logic from the original page) ----
  const [search, setSearch]     = useState('')
  const [mode, setMode]         = useState('')
  const [jobType, setJobType]   = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary]     = useState('')
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedIds, setSavedIds] = useState(new Set())
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [appliedIds, setAppliedIds] = useState(new Set())

  // ---- For You tab state ----
  const [recJobs, setRecJobs]         = useState([])
  const [recLoading, setRecLoading]   = useState(false)
  const [recError, setRecError]       = useState(null)
  const [recFetched, setRecFetched]   = useState(false)

  // ---- shared detail-panel selection (per tab, so switching tabs keeps each selection) ----
  const [selectedBrowseId, setSelectedBrowseId] = useState(null)
  const [selectedRecId, setSelectedRecId]       = useState(null)

  async function handleApply(job) {
    setApplying(true)
    try {
      await createApplication({
        job_title: job.title,
        company: job.company,
        job_url: job.source_url,
        status: 'applied',
        applied_date: new Date().toISOString().split('T')[0],
      })
      setAppliedIds(prev => new Set(prev).add(job.id))
      // refresh pipeline in background so switching tabs shows it immediately
      fetchApplications()
    } catch (err) {
      console.error('Failed to create application:', err)
    } finally {
      setApplying(false)
    }
  } 

  const fetchApplications = useCallback(async () => {
    try {
      setAppsLoading(true)
      const data = await getApplications()
      setApplications(data)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setAppsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'pipeline') fetchApplications()
  }, [activeTab, fetchApplications])


  const fetchJobs = useCallback(async () => {
    // jobspy requires search_term + location — skip the call until both exist
    if (!search || !location) {
      setJobs([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await jobsScraperService.scrapeJobs(search, location, 20)
      const rawList = Array.isArray(data) ? data : (data?.jobs || [])
      let mapped = rawList.map(mapScrapedJob)

      if (jobType) mapped = mapped.filter(j => j.job_type === jobType)
      if (mode === 'remote') mapped = mapped.filter(j => j.job_type === 'remote' || /remote/i.test(j.location || ''))
      if (salary)  mapped = mapped.filter(j => j._min_amount >= Number(salary))

      setJobs(mapped)
      setSelectedBrowseId(mapped[0]?.id ?? null)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, location, jobType, mode, salary])

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 500)
    return () => clearTimeout(timer)
  }, [fetchJobs])

  const fetchRecommended = useCallback(async () => {
    if (!uid) {
      setRecError('no-user')
      return
    }
    try {
      setRecLoading(true)
      setRecError(null)
      const data = await jobsScraperService.getRecommendedJobs(uid)
      const mapped = Array.isArray(data) ? data.map(mapRecommendedJob) : []
      setRecJobs(mapped)
      setSelectedRecId(mapped[0]?.id ?? null)
    } catch (error) {
      console.error('Failed to fetch recommended jobs:', error)
      setRecError('failed')
      setRecJobs([])
    } finally {
      setRecLoading(false)
      setRecFetched(true)
    }
  }, [uid])

  // lazy-load recommendations the first time the "For You" tab is opened
  useEffect(() => {
    if (activeTab === 'foryou' && !recFetched && !recLoading) {
      fetchRecommended()
    }
  }, [activeTab, recFetched, recLoading, fetchRecommended])

  const clearFilters = () => {
    setSearch('')
    setMode('')
    setJobType('')
    setLocation('')
    setSalary('')
  }

  const hasFilters = search || mode || jobType || location || salary

  const list       = activeTab === 'foryou' ? recJobs : jobs
  const listLoading = activeTab === 'foryou' ? recLoading : loading
  const selectedId  = activeTab === 'foryou' ? selectedRecId : selectedBrowseId
  const setSelectedId = activeTab === 'foryou' ? setSelectedRecId : setSelectedBrowseId
  const selectedJob = list.find(j => j.id === selectedId) || null

  return (
    <MainLayout>
      <div className="space-y-5 animate-fade-in max-w-7xl">

        {/* Header + tabs */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-1">
              JOB SEARCH
            </p>
            <h1 className="text-3xl font-bold text-white">Jobs</h1>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-white/[0.08]">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
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

        {/* Browse filters */}
        {activeTab === 'browse' && (
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
                      mode === opt.value
                        ? 'bg-white text-slate-950'
                        : 'text-slate-400 hover:text-white'
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
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={13} />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* For You intro line */}
        {activeTab === 'foryou' && (
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            Matched to your profile — skills, preferred role, and location.
          </p>
        )}

        {/* Pipeline  */}
        {activeTab === 'pipeline' && (
          appsLoading ? (
            <div className="flex items-center justify-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Loader2 size={26} className="animate-spin text-cyan-400" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Briefcase size={44} className="mx-auto text-slate-600 mb-3" />
              <p className="font-medium text-white">Nothing in your pipeline yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Jobs you save from Browse or For You will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['applied', 'interview', 'offer', 'rejected'].map(status => (
                <div key={status}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                    {status} ({applications.filter(a => a.status === status).length})
                  </p>
                  <div className="space-y-2">
                    {applications.filter(a => a.status === status).map(app => (
                      <div key={app.id} className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                        <p className="text-sm font-medium text-white">{app.job_title}</p>
                        <p className="text-xs text-slate-500">{app.company}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Master-detail layout for Browse / For You */}
        {activeTab !== 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 items-start">

            {/* List */}
            <div className="space-y-3">
              {listLoading ? (
                <div className="flex items-center justify-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <Loader2 size={26} className="animate-spin text-cyan-400" />
                </div>
              ) : activeTab === 'foryou' && recError === 'no-user' ? (
                <EmptyState
                  title="Sign in to see recommendations"
                  body="We need your profile to match jobs to your skills."
                />
              ) : activeTab === 'foryou' && recError === 'failed' ? (
                <EmptyState title="Couldn't load recommendations" body="Try again in a moment." />
              ) : list.length === 0 ? (
                <EmptyState
                  title={
                    activeTab === 'foryou'
                      ? 'No matches yet'
                      : (!search || !location ? 'Enter a job title and location to search' : 'No jobs found')
                  }
                  body={
                    activeTab === 'foryou'
                      ? 'Fill out your profile skills to get recommendations.'
                      : (!search || !location
                        ? 'Both fields are required to search live job listings'
                        : 'Try adjusting your search or filters')
                  }
                />
              ) : (
                list.map(job => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedId(job.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedId === job.id
                        ? 'border-cyan-400/40 bg-cyan-400/[0.06]'
                        : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <ChevronRight size={15} className="text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white leading-tight text-sm truncate">{job.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Building2 size={11} />
                          <span className="truncate">{job.company}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {job.location}
                            </span>
                          )}
                          {job.posted_at && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(job.posted_at).toLocaleDateString()}
                            </span>
                          )}
                          {!job.posted_at && activeTab !== 'foryou' && <span>today</span>}
                        </div>
                      </div>
                      {job.match_score != null && (
                        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {Math.round(job.match_score)}%
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Detail panel */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 lg:sticky lg:top-4 min-h-[420px]">
              {selectedJob ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-white leading-tight">{selectedJob.title}</h2>
                      <p className="text-sm text-slate-400 mt-1">{selectedJob.company}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                        {selectedJob.location && (
                          <span className="flex items-center gap-1"><MapPin size={12} />{selectedJob.location}</span>
                        )}
                        {selectedJob.posted_at && (
                          <span>{new Date(selectedJob.posted_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-5">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-semibold hover:bg-cyan-400 transition-all">
                      <Target size={14} />
                      Tailor for this
                    </button>
                    <button
                      onClick={() => handleSaveJob(selectedJob)}
                      disabled={saving || savedIds.has(selectedJob.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Bookmark size={14} className={savedIds.has(selectedJob.id) ? 'fill-current' : ''} />
                      {savedIds.has(selectedJob.id) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleApply(selectedJob)}
                      disabled={applying || appliedIds.has(selectedJob.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      {appliedIds.has(selectedJob.id) ? 'Applied' : applying ? 'Applying…' : 'Apply'}
                    </button>
                    {selectedJob.source_url && (
                      <a
                        href={selectedJob.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        View posting
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/[0.06]">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-3">
                      About this role
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedJob.description || 'No description provided for this listing.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <Briefcase size={40} className="text-slate-600 mb-3" />
                  <p className="text-slate-500 text-sm">Select a job to see the details</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  )
}

function EmptyState({ title, body }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <Briefcase size={40} className="mx-auto text-slate-600 mb-3" />
      <p className="font-medium text-white text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-1">{body}</p>
    </div>
  )
}

export default Jobs
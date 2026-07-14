import { useState, useEffect, useCallback } from "react"
import MainLayout from "../components/layout/MainLayout.jsx"
import { getSavedJobs, deleteSavedJob } from "../services/saveJobs.service.js"
import {
  Bookmark, MapPin, Building2, DollarSign, Loader2,
  ExternalLink, Trash2, Briefcase
} from "lucide-react"

function Glass({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl ${className}`} {...rest}>
      {children}
    </div>
  )
}

export default function SavedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  const fetchSaved = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSavedJobs()
      setJobs(data)
    } catch (err) {
      console.error("Failed to fetch saved jobs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  async function handleRemove(id) {
    setRemovingId(id)
    try {
      await deleteSavedJob(id)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch (err) {
      console.error("Failed to remove saved job:", err)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-5 animate-fade-in max-w-5xl">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-1">
            BOOKMARKED
          </p>
          <h1 className="text-3xl font-bold text-white">Saved Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} saved
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={26} className="animate-spin text-cyan-400" />
          </div>
        ) : jobs.length === 0 ? (
          <Glass className="p-12 text-center">
            <Bookmark size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="font-medium text-white">No saved jobs yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Jobs you bookmark from Browse or For You will show up here.
            </p>
          </Glass>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map(job => (
              <Glass key={job.id} className="p-4 relative">
                <button
                  onClick={() => handleRemove(job.id)}
                  disabled={removingId === job.id}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all disabled:opacity-50"
                  title="Remove"
                >
                  {removingId === job.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>

                {job.job_type && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-2 inline-block">
                    {job.job_type}
                  </span>
                )}

                <h3 className="text-sm font-semibold text-white pr-6">{job.job_title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Building2 size={11} />
                  {job.company}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={11} />
                      {job.salary}
                    </span>
                  )}
                </div>

                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors w-fit"
                  >
                    View posting <ExternalLink size={11} />
                  </a>
                )}
              </Glass>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
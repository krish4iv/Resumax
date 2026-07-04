import { useEffect, useState } from 'react'
import api from '../services/api.service.js'
import MainLayout from '../components/layout/MainLayout.jsx'
import { useSelector } from 'react-redux'
import { auth } from '../config/firebase.js'
import { theme } from '../theme/index.js'
import {
  Briefcase, BookmarkCheck, Eye,
  MapPin, Building2, Clock, Loader2
} from 'lucide-react'

const stats = [
  { label: 'Jobs Applied',   value: '12', icon: Briefcase,    color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
  { label: 'Saved Jobs',     value: '5',  icon: BookmarkCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Profile Views',  value: '48', icon: Eye,           color: 'text-emerald-500', bg: 'bg-emerald-500/10'},
]

const Dashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (!auth.currentUser) return
        const token = await auth.currentUser.getIdToken()
        const response = await api.get('/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setJobs(response.data)
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [user])

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-semibold ${theme.heading}`}>
            Welcome back, {user?.name || user?.email?.split('@')[0]} 👋
          </h1>
          <p className={theme.subtext}>
            Here's what's happening with your job search
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${theme.statCard} flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className={theme.subtext}>{label}</p>
                <p className={`text-2xl font-bold ${theme.heading}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${theme.heading}`}>
              Recent Jobs
            </h2>
            <a href="/jobs" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
              View all →
            </a>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : jobs.length === 0 ? (
            <div className={`${theme.card} text-center py-12`}>
              <Briefcase size={40} className="mx-auto text-slate-400 mb-3" />
              <p className={theme.subtext}>No jobs found</p>
              <p className="text-xs text-slate-400 mt-1">
                Jobs will appear here once added
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobs.slice(0, 6).map((job) => (
                <div key={job.id} className={theme.cardHover}>

                  {/* Job type badge */}
                  {job.job_type && (
                    <span className={`${theme.badge} ${theme.badgeBlue} mb-3`}>
                      {job.job_type}
                    </span>
                  )}

                  {/* Title & Company */}
                  <h3 className={`font-semibold ${theme.heading} mb-1`}>
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <Building2 size={13} />
                    {job.company}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
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

                  {/* Posted at */}
                  {job.posted_at && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <Clock size={11} />
                      {new Date(job.posted_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  )
}

export default Dashboard
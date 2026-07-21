import { useEffect, useState } from 'react'
import api from '../services/api.service.js'
import MainLayout from '../components/layout/MainLayout.jsx'
import { useSelector } from 'react-redux'
import { auth } from '../config/firebase.js'
import { Link } from 'react-router-dom'
import { getSavedJobs } from '../services/saveJobs.service.js'
import { getResumes } from '../services/resume.service.js'
import { getInterviewStats } from '../services/interview.service.js'
import {
  Briefcase, BookmarkCheck, Eye, MapPin,
  Building2, Clock, Loader2, ChevronRight,
  TrendingUp
} from 'lucide-react'

const Dashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [resumeCount, setResumeCount] = useState(0)
  const [interviewSolved, setInterviewSolved] = useState(0)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) return

        const [jobsRes, appsRes, savedRes, resumesRes, interviewRes] = await Promise.allSettled([
          api.get('/jobs'),
          api.get('/applications'),
          getSavedJobs(),
          getResumes(),
          getInterviewStats('coding'),
        ])

        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data)
        if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data)
        if (savedRes.status === 'fulfilled') setSavedJobs(savedRes.value)
        if (resumesRes.status === 'fulfilled') setResumeCount(resumesRes.value.length || 0)
        if (interviewRes.status === 'fulfilled') setInterviewSolved(interviewRes.value.solved || 0)

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const realStats = [
    { label: 'Jobs Applied',  value: applications.length || 0, icon: Briefcase,    color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
    { label: 'Saved Jobs',    value: savedJobs.length || 0,     icon: BookmarkCheck, color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
    { label: 'Recent Jobs',   value: jobs.length || 0,          icon: Eye,           color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  // Application status breakdown
  const statusCounts = {
    applied:   applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer:     applications.filter(a => a.status === 'offer').length,
    rejected:  applications.filter(a => a.status === 'rejected').length,
  }

  // 3-step progress, derived from real account state instead of hardcoded status.
  // A step is "done" once its underlying condition is true; the first
  // not-done step is "active"; anything after that is "next".
  const stepConditions = [
    {
      n: '01', label: 'Sharpen your resume', done: resumeCount > 0,
      desc: 'Upload and analyze your resume for ATS score', route: '/documents',
    },
    {
      n: '02', label: 'Apply to matches', done: applications.length > 0,
      desc: 'Browse and apply to jobs matched to your profile', route: '/jobs',
    },
    {
      n: '03', label: 'Prep for interviews', done: interviewSolved > 0,
      desc: 'Practice with AI-generated interview questions', route: '/interview',
    },
  ]
  const firstNotDoneIndex = stepConditions.findIndex(s => !s.done)
  const activeIndex = firstNotDoneIndex === -1 ? stepConditions.length - 1 : firstNotDoneIndex
  const steps = stepConditions.map((s, i) => ({
    ...s,
    status: s.done ? 'done' : i === activeIndex ? 'active' : 'next',
  }))
  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-1">
              GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'},
              {' '}{(user?.name || user?.email?.split('@')[0] || '').toUpperCase()}
            </p>
            <h1 className="text-3xl font-bold text-white">
              Your career dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your job search progress
            </p>
          </div>
          <Link to="/jobs"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            Browse Jobs <ChevronRight size={14} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {realStats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label}
              className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Application Pipeline */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" />
              Application Pipeline
            </h2>
            {/* Was a Link to /applications, a route that doesn't exist anywhere
                in App.jsx — removed rather than pointing at a dead page. Add
                this back once there's an actual Applications list page. */}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Applied',   count: statusCounts.applied,   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
              { label: 'Interview', count: statusCounts.interview,  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
              { label: 'Offer',     count: statusCounts.offer,      color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
              { label: 'Rejected',  count: statusCounts.rejected,   color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20'   },
            ].map(({ label, count, color, bg, border }) => (
              <div key={label} className={`p-4 rounded-xl border ${border} ${bg} text-center`}>
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3-step progress — now derived from real resume/application/interview state */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-500 tracking-wide uppercase">Your progress</p>
            <p className="text-xs text-slate-500">{doneCount} of {steps.length}</p>
          </div>
          <div className="flex gap-1.5 mb-5">
            {steps.map((s, i) => (
              <div key={s.n} className={`h-1 flex-1 rounded-full ${s.status !== 'next' ? 'bg-cyan-400' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="space-y-4">
            {steps.map(({ n, label, status, desc, route }) => (
              <div key={n} className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                status === 'active' ? 'bg-white/[0.05] border border-white/10' : ''
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  status === 'done'   ? 'bg-cyan-500'    :
                  status === 'active' ? 'border-2 border-cyan-400 bg-transparent' :
                  'border border-white/20 bg-transparent'
                }`}>
                  {status === 'done' && <span className="text-[10px] text-white">✓</span>}
                  {status === 'active' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600">{n}</span>
                    <p className={`text-sm font-semibold ${status === 'next' ? 'text-slate-500' : 'text-white'}`}>
                      {label}
                    </p>
                    {status === 'done'   && <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">DONE</span>}
                    {status === 'active' && <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">NOW</span>}
                    {status === 'next'   && <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">NEXT</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  {status === 'active' && (
                    <Link to={route} className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-2 transition-colors">
                      Go to {label} <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs from DB */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
            <Link to="/jobs" className="text-xs text-slate-500 hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Briefcase size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">No jobs yet</p>
              <Link to="/jobs" className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
                Browse jobs →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {jobs.slice(0, 6).map((job) => (
                <div key={job.id}
                  className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer">
                  {job.job_type && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2 inline-block">
                      {job.job_type}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-white mb-1">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <Building2 size={11} />{job.company}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    {job.location && <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
                    {job.salary && <span>💰 {job.salary}</span>}
                  </div>
                  {job.posted_at && (
                    <div className="flex items-center gap-1 text-xs text-slate-600 mt-2 pt-2 border-t border-white/[0.06]">
                      <Clock size={10} />
                      {new Date(job.posted_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Features */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">AI Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Job Recommendations', desc: 'AI-matched jobs based on your profile', route: '/jobs', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Skill Gap Analysis',  desc: 'See which skills to learn next',        route: '/documents', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { label: 'Resume ATS Score',    desc: 'Upload resume and get instant feedback', route: '/documents', icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(({ label, desc, route, icon: Icon, color, bg }) => (
              <Link key={label} to={route}
                className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group">
                <div className={`p-2.5 rounded-xl ${bg} w-fit mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
                <p className="text-xs text-cyan-400 mt-3 group-hover:text-cyan-300 transition-colors">
                  Open →
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  )
}

export default Dashboard
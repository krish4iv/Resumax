import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { theme } from '../theme/index.js'
import { Loader2, Briefcase, MapPin, Building2, ExternalLink } from 'lucide-react'
import recommendationsService from '../services/recommendations.service.js'

const JobRecommendations = ({ uid }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!uid) return
    const fetchJobs = async () => {
      try {
        const data = await recommendationsService.getRecommendations(uid)
        setJobs(data)
      } catch (err) {
        setError('Failed to load recommendations')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [uid])

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 size={24} className="animate-spin text-blue-500" />
    </div>
  )

  if (error) return <p className="text-red-400 text-sm text-center py-4">{error}</p>

  if (jobs.length === 0) return (
    <div className="text-center py-8">
      <Briefcase size={32} className="mx-auto text-slate-400 mb-2" />
      <p className={theme.subtext}>No recommendations yet</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {jobs.map((job, i) => (
        <div key={i} className={theme.cardHover}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={`font-semibold text-sm ${theme.heading}`}>{job.title}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <Building2 size={11} />{job.company}
              </div>
            </div>
            <span className={`${theme.badge} ${theme.badgeGreen} text-xs`}>
              {job.match_score}% Match
            </span>
          </div>
          {job.location && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
              <MapPin size={11} />{job.location}
            </div>
          )}
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.btnPrimary} text-xs py-1.5 px-3 flex items-center gap-1 w-fit`}
            >
              <ExternalLink size={11} /> Apply Now
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

export default JobRecommendations
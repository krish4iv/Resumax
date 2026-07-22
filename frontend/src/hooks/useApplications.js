import { useState, useCallback, useEffect } from 'react'
import { getApplications, createApplication } from '../services/application.service.js'

// enabled = only fetch once the Pipeline tab has actually been opened
export default function useApplications(enabled) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(false)
  const [applying, setApplying]         = useState(false)
  const [appliedIds, setAppliedIds]     = useState(new Set())

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getApplications()
      setApplications(data)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) fetchApplications()
  }, [enabled, fetchApplications])

  const applyToJob = useCallback(async (job) => {
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
      fetchApplications() // refresh pipeline in background so switching tabs shows it immediately
    } catch (err) {
      console.error('Failed to create application:', err)
    } finally {
      setApplying(false)
    }
  }, [fetchApplications])

  return { applications, loading, applying, appliedIds, applyToJob }
}
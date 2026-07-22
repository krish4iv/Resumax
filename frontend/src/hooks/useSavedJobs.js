import { useState, useCallback } from 'react'
import { saveJob } from '../services/saveJobs.service.js'

export default function useSavedJobs() {
  const [saving, setSaving]     = useState(false)
  const [savedIds, setSavedIds] = useState(new Set())

  const saveJobToList = useCallback(async (job) => {
    setSaving(true)
    try {
      await saveJob({
        job_title: job.title,
        company: job.company,
        job_url: job.source_url,
        location: job.location,
      })
      setSavedIds(prev => new Set(prev).add(job.id))
    } catch (err) {
      console.error('Failed to save job:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, savedIds, saveJobToList }
}
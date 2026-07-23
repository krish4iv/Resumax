import { useState, useCallback } from 'react'
import { saveJob } from '../services/saveJobs.service.js'

export default function useSavedJobs() {
  const [saving, setSaving]     = useState(false)
  const [savedIds, setSavedIds] = useState(new Set())
  const [error, setError]       = useState(null)

  const saveJobToList = useCallback(async (job) => {
    setSaving(true)
    setError(null)
    try {
      await saveJob(job)
      setSavedIds(prev => new Set(prev).add(job.id))
    } catch (err) {
      console.error('Failed to save job:', err)
      setError('Could not save this job — try again in a moment.')
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, savedIds, saveJobToList, error }
}
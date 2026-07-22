import { useState, useCallback, useEffect } from 'react'
import { getRecommendations } from '../services/recommendations.service.js'
import { mapRecommendedJob } from '../utils/jobMappers.js'

// enabled = only fetch once the "For You" tab has actually been opened
export default function useRecommendedJobs(uid, enabled) {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [fetched, setFetched] = useState(false)

  const fetchRecommended = useCallback(async () => {
    if (!uid) {
      setError('no-user')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await getRecommendations(uid)
      setJobs(Array.isArray(data) ? data.map(mapRecommendedJob) : [])
    } catch (error) {
      console.error('Failed to fetch recommended jobs:', error)
      setError('failed')
      setJobs([])
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }, [uid])

  // lazy-load the first time the tab is opened
  useEffect(() => {
    if (enabled && !fetched && !loading) fetchRecommended()
  }, [enabled, fetched, loading, fetchRecommended])

  return { jobs, loading, error, fetched }
}
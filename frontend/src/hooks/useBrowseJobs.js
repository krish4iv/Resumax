import { useState, useEffect, useCallback } from 'react'
import jobsScraperService from '../services/jobs.service.js'
import { mapScrapedJob } from '../utils/jobMappers.js'

const RESULTS_WANTED = 50

export default function useBrowseJobs() {
  const [search, setSearch]     = useState('')
  const [location, setLocation] = useState('')
  const [mode, setMode]         = useState('')
  const [jobType, setJobType]   = useState('')
  const [salary, setSalary]     = useState('')

  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(false)

  const hasRequiredFields = Boolean(search && location)
  const hasFilters = Boolean(search || mode || jobType || location || salary)

  const fetchJobs = useCallback(async () => {
    // jobspy requires search_term + location — skip the call until both exist
    if (!hasRequiredFields) {
      setJobs([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await jobsScraperService.scrapeJobs(search, location, RESULTS_WANTED)
      const rawList = Array.isArray(data) ? data : (data?.jobs || [])
      let mapped = rawList.map(mapScrapedJob)

      if (jobType) mapped = mapped.filter(j => j.job_type === jobType)
      if (mode === 'remote') mapped = mapped.filter(j => j.job_type === 'remote' || /remote/i.test(j.location || ''))
      if (salary) mapped = mapped.filter(j => j._min_amount >= Number(salary))

      setJobs(mapped)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, location, jobType, mode, salary, hasRequiredFields])

  // debounce so we don't hit the scraper on every keystroke
  useEffect(() => {
    const timer = setTimeout(fetchJobs, 500)
    return () => clearTimeout(timer)
  }, [fetchJobs])

  const clearFilters = () => {
    setSearch('')
    setMode('')
    setJobType('')
    setLocation('')
    setSalary('')
  }

  return {
    filters: { search, location, mode, jobType, salary },
    setters: { setSearch, setLocation, setMode, setJobType, setSalary },
    jobs,
    loading,
    hasFilters,
    clearFilters,
  }
}
import { useState, useEffect, useCallback } from 'react'
import jobsScraperService from '../services/jobs.service.js'
import { mapScrapedJob } from '../utils/jobMappers.js'

// bumped from 20 -> 50 so paginating the results is actually meaningful
const RESULTS_WANTED = 50

const STORAGE_KEY = 'jobs:browse-cache:v1'

const EMPTY_CACHE = {
  filters: { search: '', location: '', mode: '', jobType: '', salary: '' },
  jobs: [],
  lastFetchedKey: null,
}

function loadCache() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    // sessionStorage can be unavailable (private browsing, SSR) or the
    // stored value can be corrupt — either way, fall back to a clean cache
    // rather than breaking the page.
    console.warn('Failed to read cached job search:', err)
  }
  return structuredClone(EMPTY_CACHE)
}

// Module-level cache, backed by sessionStorage. This is what lets a
// previous search's results show up immediately — without re-typing
// anything — both when switching routes (component unmounts/remounts,
// this module doesn't) and after a full page reload (sessionStorage
// survives that; a plain in-memory object wouldn't). It clears when the
// browser tab itself is closed, which is the right lifetime for "recent
// search," not permanent history.
const cache = loadCache()

function persistCache() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (err) {
    // storage full / disabled — not worth breaking search over, just skip
  }
}

function filterKey(f) {
  return `${f.search}|${f.location}|${f.jobType}|${f.mode}|${f.salary}`
}

export default function useBrowseJobs() {
  const [search, setSearchState]     = useState(cache.filters.search)
  const [location, setLocationState] = useState(cache.filters.location)
  const [mode, setModeState]         = useState(cache.filters.mode)
  const [jobType, setJobTypeState]   = useState(cache.filters.jobType)
  const [salary, setSalaryState]     = useState(cache.filters.salary)

  // Shown immediately on mount, straight from cache — this is what makes
  // previous results visible before any search runs on this mount.
  const [jobs, setJobsState]  = useState(cache.jobs)
  const [loading, setLoading] = useState(false)

  // every setter writes through to the cache (and persists it), so the
  // next mount — whether from a route switch or a full reload — picks up
  // exactly where this one left off
  const setSearch   = useCallback((v) => { cache.filters.search = v;   persistCache(); setSearchState(v) }, [])
  const setLocation = useCallback((v) => { cache.filters.location = v; persistCache(); setLocationState(v) }, [])
  const setMode      = useCallback((v) => { cache.filters.mode = v;     persistCache(); setModeState(v) }, [])
  const setJobType    = useCallback((v) => { cache.filters.jobType = v;  persistCache(); setJobTypeState(v) }, [])
  const setSalary     = useCallback((v) => { cache.filters.salary = v;   persistCache(); setSalaryState(v) }, [])

  const setJobs = useCallback((v) => { cache.jobs = v; persistCache(); setJobsState(v) }, [])

  const hasRequiredFields = Boolean(search && location)
  const hasFilters = Boolean(search || mode || jobType || location || salary)

  const fetchJobs = useCallback(async () => {
    // jobspy requires search_term + location — skip the call until both exist
    if (!hasRequiredFields) {
      setJobs([])
      cache.lastFetchedKey = null
      persistCache()
      setLoading(false)
      return
    }

    const key = filterKey({ search, location, jobType, mode, salary })

    // Nothing has actually changed since the last successful fetch — most
    // likely we just remounted (route switch or reload) with the same
    // search still active. Reuse the cached results instead of re-scraping.
    if (key === cache.lastFetchedKey && cache.jobs.length > 0) {
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
      cache.lastFetchedKey = key
      persistCache()
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setJobs([])
      cache.lastFetchedKey = null
      persistCache()
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
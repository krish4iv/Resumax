// src/services/jobs.service.js
import { createExternalApi } from './externalApi.js'
import { API_URLS } from '../config/apiConfig.js'

const jobScraperApi = createExternalApi(API_URLS.jobScraper)

async function scrapeJobs(searchTerm, location, resultsWanted = 20) {
  const response = await jobScraperApi.get('/scrape_jobs', {
    params: {
      search_term: searchTerm,
      location: location,
      results_wanted: resultsWanted,
    },
  })
  return response.data
}

export default {
  scrapeJobs,
}
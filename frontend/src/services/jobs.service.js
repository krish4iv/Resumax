import axios from "axios";

const JOBS_API_URL = "http://localhost:8000";

async function scrapeJobs(searchTerm, location, resultsWanted = 20) {
  try {
    const response = await axios.get(`${JOBS_API_URL}/scrape_jobs`, {
      params: {
        search_term: searchTerm,
        location: location,
        results_wanted: resultsWanted
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to scrape jobs:', error)
    throw error
  }
}

export default {
    scrapeJobs
};
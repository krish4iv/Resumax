import axios from 'axios'
import { auth } from '../config/firebase.js'

const BACKEND_API = 'http://localhost:5000/api'

async function getAuthHeaders() {
  const token = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export const saveJob = async (job) => {
  const headers = await getAuthHeaders()
  const response = await axios.post(`${BACKEND_API}/saved-jobs`, {
    job_title: job.title,
    company: job.company,
    job_url: job.source_url,
    location: job.location,
    salary: job.salary,
    job_type: job.job_type,
  }, { headers })
  return response.data
}

export const getSavedJobs = async () => {
  const headers = await getAuthHeaders()
  const response = await axios.get(`${BACKEND_API}/saved-jobs`, { headers })
  return response.data
}

export const deleteSavedJob = async (id) => {
  const headers = await getAuthHeaders()
  const response = await axios.delete(`${BACKEND_API}/saved-jobs/${id}`, { headers })
  return response.data
}
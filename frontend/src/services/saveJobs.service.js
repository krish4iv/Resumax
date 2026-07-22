
import api from './api.service.js'

export const saveJob = async (job) => {
  const response = await api.post('/saved-jobs', {
    job_title: job.title,
    company: job.company,
    job_url: job.source_url,
    location: job.location,
    salary: job.salary,
    job_type: job.job_type,
  })
  return response.data
}

export const getSavedJobs = async () => {
  const response = await api.get('/saved-jobs')
  return response.data
}

export const deleteSavedJob = async (id) => {
  const response = await api.delete(`/saved-jobs/${id}`)
  return response.data
}
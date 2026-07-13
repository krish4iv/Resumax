// src/services/application.service.js
import api from './api.service.js'

export const getApplications = async () => {
  const response = await api.get('/applications')
  return response.data
}

export const createApplication = async (data) => {
  const response = await api.post('/applications', data)
  return response.data
}
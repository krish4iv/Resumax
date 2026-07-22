
import api from './api.service.js'

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data)
  return response.data
}

export const getExperience = async () => {
  const response = await api.get('/experience')
  return response.data
}
export const createExperience = async (data) => {
  const response = await api.post('/experience', data)
  return response.data
}
export const updateExperience = async (id, data) => {
  const response = await api.put(`/experience/${id}`, data)
  return response.data
}
export const deleteExperience = async (id) => {
  const response = await api.delete(`/experience/${id}`)
  return response.data
}

export const getEducation = async () => {
  const response = await api.get('/education')
  return response.data
}
export const createEducation = async (data) => {
  const response = await api.post('/education', data)
  return response.data
}
export const updateEducation = async (id, data) => {
  const response = await api.put(`/education/${id}`, data)
  return response.data
}
export const deleteEducation = async (id) => {
  const response = await api.delete(`/education/${id}`)
  return response.data
}
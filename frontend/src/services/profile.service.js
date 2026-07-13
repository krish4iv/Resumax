// src/services/profile.service.js
import axios from 'axios'
import { auth } from '../config/firebase.js'

const BACKEND_API = 'http://localhost:5000/api'

async function getAuthHeaders() {
  const token = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export const updateProfile = async (data) => {
  const headers = await getAuthHeaders()
  const response = await axios.put(`${BACKEND_API}/auth/profile`, data, { headers })
  return response.data
}

export const getExperience = async () => {
  const headers = await getAuthHeaders()
  const response = await axios.get(`${BACKEND_API}/experience`, { headers })
  return response.data
}
export const createExperience = async (data) => {
  const headers = await getAuthHeaders()
  const response = await axios.post(`${BACKEND_API}/experience`, data, { headers })
  return response.data
}
export const updateExperience = async (id, data) => {
  const headers = await getAuthHeaders()
  const response = await axios.put(`${BACKEND_API}/experience/${id}`, data, { headers })
  return response.data
}
export const deleteExperience = async (id) => {
  const headers = await getAuthHeaders()
  const response = await axios.delete(`${BACKEND_API}/experience/${id}`, { headers })
  return response.data
}

export const getEducation = async () => {
  const headers = await getAuthHeaders()
  const response = await axios.get(`${BACKEND_API}/education`, { headers })
  return response.data
}
export const createEducation = async (data) => {
  const headers = await getAuthHeaders()
  const response = await axios.post(`${BACKEND_API}/education`, data, { headers })
  return response.data
}
export const updateEducation = async (id, data) => {
  const headers = await getAuthHeaders()
  const response = await axios.put(`${BACKEND_API}/education/${id}`, data, { headers })
  return response.data
}
export const deleteEducation = async (id) => {
  const headers = await getAuthHeaders()
  const response = await axios.delete(`${BACKEND_API}/education/${id}`, { headers })
  return response.data
}
import axios from 'axios'
import { auth } from '../config/firebase.js'

const BACKEND_API = 'http://localhost:5000/api'

async function getAuthHeaders() {
  const token = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export const getApplications = async () => {
  const headers = await getAuthHeaders()
  const response = await axios.get(`${BACKEND_API}/applications`, { headers })
  return response.data
}

export const createApplication = async (data) => {
  const headers = await getAuthHeaders()
  const response = await axios.post(`${BACKEND_API}/applications`, data, { headers })
  return response.data
}
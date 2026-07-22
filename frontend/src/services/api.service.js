

import axios from 'axios'
import { auth } from '../config/firebase.js'
import { API_URLS } from '../config/apiConfig.js'

const api = axios.create({
  baseURL: API_URLS.backend,
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  if (import.meta.env.DEV) {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
  }

  if (!config.headers?.Authorization && auth.currentUser) {
    const token = await auth.currentUser.getIdToken()
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url
    const status = error.response?.status
    console.error(`API Error: ${status ?? 'network'} on ${url}`, error.message)
    return Promise.reject(error)
  }
)

export default api
// src/services/api.service.js
//
// The ONE axios instance for calls to our Node/Express backend.
// Every backend-facing service file should import `api` from here instead
// of creating its own axios + hardcoded BACKEND_API + getAuthHeaders()
// (that pattern was previously duplicated in application/profile/saveJobs/
// resume service files — same 6 lines copy-pasted in each one).
//
// The request interceptor now attaches the Firebase auth token
// automatically, so individual service functions don't need to call
// getAuthHeaders() themselves anymore. If a caller already set an
// Authorization header manually (a few pages still do this explicitly,
// e.g. useAuth.js), we leave it alone rather than overwrite it.

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
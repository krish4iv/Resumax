import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`)
  return config
})

export default api
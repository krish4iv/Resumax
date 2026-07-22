import axios from 'axios'

export function createExternalApi(baseURL) {
  const instance = axios.create({ baseURL })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url
      const status = error.response?.status
      console.error(`External API Error: ${status ?? 'network'} on ${baseURL}${url}`, error.message)
      return Promise.reject(error)
    }
  )

  return instance
}
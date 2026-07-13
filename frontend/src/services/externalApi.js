// src/services/externalApi.js
//
// Factory for axios instances that talk to our Python microservices
// (job scraper, news, skill analysis, recommendations, resume AI).
// None of these need Firebase auth headers — they're separate local
// services. This just gives every microservice call the same base
// config and the same error-logging behavior, instead of each service
// file writing its own try/catch + console.error(...) by hand.

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
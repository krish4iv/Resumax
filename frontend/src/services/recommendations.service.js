// src/services/recommendations.service.js
import { createExternalApi } from './externalApi.js'
import { API_URLS } from '../config/apiConfig.js'

const recommendationsApi = createExternalApi(API_URLS.recommendations)

export const getRecommendations = async (uid) => {
  const response = await recommendationsApi.get(`/api/recommend_jobs/${uid}`)
  return response.data
}

export default {
  getRecommendations,
}
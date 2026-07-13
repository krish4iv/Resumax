// src/services/skillAnalysis.service.js
import { createExternalApi } from './externalApi.js'
import { API_URLS } from '../config/apiConfig.js'

const skillAnalysisApi = createExternalApi(API_URLS.skillAnalysis)

async function getSkillGapAnalysis(uid) {
  const response = await skillAnalysisApi.get(`/api/skill_gap_analysis/${uid}`)
  return response.data
}

async function getTrendingSkills() {
  const response = await skillAnalysisApi.get('/api/trending_skills')
  return response.data
}

export default {
  getSkillGapAnalysis,
  getTrendingSkills,
}
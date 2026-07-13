// src/services/interview.service.js
import api from './api.service.js'

/* ---------------------------------------------------------------
   Interview prep — talks to Node.js backend at /api/interview
   (protected by Firebase auth middleware, handled by `api`)
----------------------------------------------------------------*/

export const listCompanies = async () => {
  const response = await api.get('/interview/companies')
  return response.data
}

/**
 * @param {object} params
 * @param {string} params.module        e.g. "coding"
 * @param {string} [params.category]
 * @param {string} [params.difficulty]  "Easy" | "Medium" | "Hard"
 * @param {string} [params.status]      "todo" | "attempted" | "solved"
 * @param {string} [params.list]        "full150" | "blind75"
 * @param {string} [params.company]     company slug, filters by company_tags
 */
export const listQuestions = async ({
  module = 'coding',
  category,
  difficulty,
  status,
  list,
  company,
} = {}) => {
  const params = { module }
  if (category) params.category = category
  if (difficulty) params.difficulty = difficulty
  if (status) params.status = status
  if (list) params.list = list
  if (company) params.company = company

  const response = await api.get('/interview/questions', { params })
  return response.data
}

export const updateQuestionProgress = async (questionId, status) => {
  const response = await api.patch(`/interview/questions/${questionId}/progress`, { status })
  return response.data
}

export const getInterviewStats = async (module = 'coding') => {
  const response = await api.get('/interview/stats', { params: { module } })
  return response.data
}
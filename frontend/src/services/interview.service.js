// src/services/interview.service.js
import api from './api.service.js'


export const listCompanies = async () => {
  const response = await api.get('/interview/companies')
  return response.data
}

/**
 * @param {object} params
 * @param {string} params.module        
 * @param {string} [params.category]
 * @param {string} [params.difficulty]  
 * @param {string} [params.status]      
 * @param {string} [params.list]        
 * @param {string} [params.company]     
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
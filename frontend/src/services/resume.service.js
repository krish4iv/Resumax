
import api from './api.service.js'
import { createExternalApi } from './externalApi.js'
import { API_URLS } from '../config/apiConfig.js'

const resumeAI = createExternalApi(API_URLS.resumeAI)


export const getResumes = async () => {
  const response = await api.get('/resumes')
  return response.data
}

export const getResumeById = async (id) => {
  const response = await api.get(`/resumes/${id}`)
  return response.data
}

export const createResume = async (resumeData) => {
  const response = await api.post('/resumes', resumeData)
  return response.data
}

export const updateResumeContent = async (id, content, filename) => {
  const response = await api.put(`/resumes/${id}`, { content, filename })
  return response.data
}

export const deleteResume = async (id) => {
  const response = await api.delete(`/resumes/${id}`)
  return response.data
}


export const analyzeResume = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await resumeAI.post('/analyze-resume/', formData)
  return response.data
}

export const summarizeBullets = async (bullets) => {
  const response = await resumeAI.post('/summarize/', { bullets })
  return response.data.summary
}

export const generatePDF = async (resumeData) => {
  const response = await resumeAI.post('/generate-pdf/', resumeData)
  return response.data.pdf_url
}

export const rewriteBullet = async (bullet) => {
  const response = await resumeAI.post('/rewrite-bullet/', { bullet })
  return response.data
}
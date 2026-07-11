import axios from 'axios'
import { auth } from '../config/firebase.js'

const RESUME_API = 'http://localhost:8009'
const BACKEND_API = 'http://localhost:5000/api'

async function getAuthHeaders() {
  const token = await auth.currentUser.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

/* ---------------------------------------------------------------
   Resume CRUD — talks to Node.js backend at /api/resumes
   (protected by Firebase auth middleware)
----------------------------------------------------------------*/
export const getResumes = async () => {
  try {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${BACKEND_API}/resumes`, { headers })
    return response.data
  } catch (error) {
    console.error('Failed to fetch resumes:', error)
    throw error
  }
}

export const getResumeById = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await axios.get(`${BACKEND_API}/resumes/${id}`, { headers })
    return response.data
  } catch (error) {
    console.error('Failed to fetch resume:', error)
    throw error
  }
}

export const createResume = async (resumeData) => {
  try {
    const headers = await getAuthHeaders()
    const response = await axios.post(`${BACKEND_API}/resumes`, resumeData, { headers })
    return response.data
  } catch (error) {
    console.error('Failed to save resume:', error)
    throw error
  }
}

export const updateResumeContent = async (id, content, filename) => {
  const headers = await getAuthHeaders()
  const response = await axios.put(`${BACKEND_API}/resumes/${id}`, { content, filename }, { headers })
  return response.data
}

export const deleteResume = async (id) => {
  try {
    const headers = await getAuthHeaders()
    const response = await axios.delete(`${BACKEND_API}/resumes/${id}`, { headers })
    return response.data
  } catch (error) {
    console.error('Failed to delete resume:', error)
    throw error
  }
}

/* ---------------------------------------------------------------
   AI microservice — FastAPI service on :8009
   (no auth needed, runs locally)
----------------------------------------------------------------*/
export const analyzeResume = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(`${RESUME_API}/analyze-resume/`, formData)
    return response.data
  } catch (error) {
    console.error('Failed to analyze resume:', error)
    throw error
  }
}

export const summarizeBullets = async (bullets) => {
  try {
    const response = await axios.post(`${RESUME_API}/summarize/`, { bullets })
    return response.data.summary
  } catch (error) {
    console.error('Failed to summarize:', error)
    throw error
  }
}

export const generatePDF = async (resumeData) => {
  try {
    const response = await axios.post(`${RESUME_API}/generate-pdf/`, resumeData)
    return response.data.pdf_url
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw error
  }
}

export const rewriteBullet = async (bullet) => {
  try {
    const response = await axios.post(`${RESUME_API}/rewrite-bullet/`, { bullet })
    return response.data
  } catch (error) {
    console.error('Failed to rewrite bullet:', error)
    throw error
  }
}
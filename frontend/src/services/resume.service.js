import axios from 'axios'

const RESUME_API = 'http://localhost:8009'

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
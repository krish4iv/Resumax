// src/config/apiConfig.js
//
// Single source of truth for every backend/microservice base URL.
// Previously these were hardcoded individually inside each service file
// (e.g. saveJobs.service.js, jobs.service.js, news.service.js all had
// their own copy of a localhost URL). Centralizing here means:
//   1. One place to change a port/host instead of N files
//   2. Every URL is overridable via .env for staging/prod without code edits
//
// Add matching keys to your .env as needed, e.g.:
//   VITE_API_BASE_URL=http://localhost:5000/api
//   VITE_JOBS_API_URL=http://localhost:8000
//   VITE_NEWS_API_URL=http://localhost:8001
//   VITE_SKILL_ANALYSIS_API_URL=http://localhost:5002
//   VITE_RECOMMENDATIONS_API_URL=http://localhost:5003
//   VITE_RESUME_AI_API_URL=http://localhost:8009
// Falls back to the same localhost ports the app already used if unset,
// so nothing breaks if you don't touch your .env right away.

export const API_URLS = {
  // Node/Express backend (Firebase-auth protected)
  backend: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

  // Python microservices (no auth)
  jobScraper: import.meta.env.VITE_JOBS_API_URL || 'http://localhost:8000',
  news: import.meta.env.VITE_NEWS_API_URL || 'http://localhost:8001',
  skillAnalysis: import.meta.env.VITE_SKILL_ANALYSIS_API_URL || 'http://localhost:5002',
  recommendations: import.meta.env.VITE_RECOMMENDATIONS_API_URL || 'http://localhost:5003',
  resumeAI: import.meta.env.VITE_RESUME_AI_API_URL || 'http://localhost:8009',
}
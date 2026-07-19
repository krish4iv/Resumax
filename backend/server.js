import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { sequelize } from './src/models/index.js'
import authRoutes from './src/routes/auth.routes.js'
import jobRoutes from './src/routes/job.routes.js'
import authMiddleware from './src/middleware/auth.middleware.js'
import userRoutes from './src/routes/user.routes.js'
import applicationRoutes from './src/routes/application.routes.js'
import savedJobRoutes from './src/routes/savedJob.routes.js'
import experienceRoutes from './src/routes/experience.routes.js'
import educationRoutes from './src/routes/education.routes.js'
import projectRoutes from './src/routes/project.routes.js'
import resumeRoutes from './src/routes/resume.routes.js'
import interviewRoutes from './src/routes/interview.routes.js'
import errorHandler from './src/middleware/errorHandler.middleware.js'
import { authLimiter, apiLimiter, resumeWriteLimiter } from './src/middleware/rateLimit.middleware.js'


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Auth endpoints get their own tighter limiter (register/login are spam/
// brute-force targets) applied before the router, on top of whatever
// per-route authMiddleware the router itself uses.
app.use('/api/auth', authLimiter, authRoutes)

// user.routes.js now requires the internal service key itself
// (see internalAuth.middleware.js) — was previously wide open here.
app.use('/api/users', userRoutes)

app.use('/api/jobs', apiLimiter, authMiddleware, jobRoutes)
app.use('/api/applications', apiLimiter, authMiddleware, applicationRoutes)
app.use('/api/saved-jobs', apiLimiter, authMiddleware, savedJobRoutes)
app.use('/api/experience', apiLimiter, authMiddleware, experienceRoutes)
app.use('/api/education', apiLimiter, authMiddleware, educationRoutes)
app.use('/api/projects', apiLimiter, authMiddleware, projectRoutes)
app.use('/api/resumes', resumeWriteLimiter, authMiddleware, resumeRoutes)
app.use('/api/interview', apiLimiter, authMiddleware, interviewRoutes)


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Must be registered LAST — catches everything asyncHandler forwards,
// plus anything Express itself catches from a thrown/rejected handler.
app.use(errorHandler)


sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database tables synced')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => console.error('❌ Sync failed:', err.message))
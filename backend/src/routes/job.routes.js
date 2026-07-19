import express from 'express'
import JobController from '../controllers/jobs.controller.js'
import requireRole from '../middleware/Role.middleware.js'

const jobRouter = express.Router()

// Public-to-authenticated-users read access — unchanged
jobRouter.get('/', JobController.getAllJobs)
jobRouter.get('/:id', JobController.getJobById)

// Previously: any authenticated user could create/delete job postings.
// job_scraper doesn't currently write into this table at all (it returns
// scraped results directly to the frontend) — so until there's a real
// service-account flow, admin-only is the correct restriction here.
jobRouter.post('/', requireRole('admin'), JobController.createJob)
jobRouter.delete('/:id', requireRole('admin'), JobController.deleteJob)

export default jobRouter
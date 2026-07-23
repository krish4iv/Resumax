import express from 'express'
import JobController from '../controllers/jobs.controller.js'
import requireRole from '../middleware/Role.middleware.js'

const jobRouter = express.Router()

// Public-to-authenticated-users read access — unchanged
jobRouter.get('/', JobController.getAllJobs)
jobRouter.get('/:id', JobController.getJobById)
jobRouter.post('/', requireRole('admin'), JobController.createJob)
jobRouter.delete('/:id', requireRole('admin'), JobController.deleteJob)

export default jobRouter
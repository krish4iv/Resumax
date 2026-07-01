import express from 'express'
import JobController from '../controllers/jobs.controller.js'
const jobRouter = express.Router()

jobRouter.get('/', JobController.getAllJobs)
jobRouter.get('/:id', JobController.getJobById)
jobRouter.post('/',JobController.createJob)
jobRouter.delete('/:id',JobController.deleteJob)

export default jobRouter
import express from 'express'
import applicationController from '../controllers/application.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(authMiddleware) // ← protect ALL routes

router.post('/', applicationController.createApplication)
router.get('/', applicationController.getAllApplications)
router.put('/:id', applicationController.updateStatus)
router.delete('/:id', applicationController.deleteApplication)

export default router
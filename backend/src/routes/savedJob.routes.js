import express from 'express';
import savedJobController from '../controllers/savedJob.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/', savedJobController.saveJob);
router.get('/', savedJobController.getSavedJobs);
router.delete('/:id', savedJobController.deleteSavedJob);

export default router;
import express from 'express';
import savedJobController from '../controllers/savedJob.controller.js';
const router = express.Router();

router.post('/', savedJobController.saveJob);
router.get('/', savedJobController.getSavedJobs);
router.delete('/:id', savedJobController.deleteSavedJob);

export default router;
import express from 'express';
import experienceController from '../controllers/experience.controller.js';

const router = express.Router();

router.post('/', experienceController.createExperience);
router.get('/', experienceController.getExperience);
router.put('/:id', experienceController.updateExperience);
router.delete('/:id', experienceController.deleteExperience);

export default router;
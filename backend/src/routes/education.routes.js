import { Router } from "express";
import educationController from "../controllers/education.controller.js";
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router();
router.use(authMiddleware)

router.post("/", educationController.createEducation);
router.get("/", educationController.getEducation);
router.put("/:id", educationController.updateEducation);
router.delete("/:id", educationController.deleteEducation);

export default router;
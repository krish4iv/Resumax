import express from "express";
import resumeController from "../controllers/resume.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", resumeController.createResume);
router.get("/", resumeController.getAllResumes);
router.get("/:id", resumeController.getResumeById);

export default router;
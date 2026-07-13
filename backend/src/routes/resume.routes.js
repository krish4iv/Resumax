import express from "express";
import resumeController from "../controllers/resume.controller.js";

const router = express.Router();

router.post("/", resumeController.createResume);
router.get("/", resumeController.getAllResumes);
router.get("/:id", resumeController.getResumeById);
router.put("/:id", resumeController.updateResume);
router.delete("/:id", resumeController.deleteResume);

export default router;
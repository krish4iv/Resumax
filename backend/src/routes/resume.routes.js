import express from "express";
import resumeController from "../controllers/resume.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/", asyncHandler(resumeController.createResume));
router.get("/", asyncHandler(resumeController.getAllResumes));
router.get("/:id", asyncHandler(resumeController.getResumeById));
router.put("/:id", asyncHandler(resumeController.updateResume));
router.delete("/:id", asyncHandler(resumeController.deleteResume));

export default router;
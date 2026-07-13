import express from "express";
import projectController from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

export default router;
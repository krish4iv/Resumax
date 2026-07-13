import express from "express"
import interviewController from "../controllers/interview.controller.js"

const InterviewRouter = express.Router()

InterviewRouter.get("/questions", interviewController.listQuestions)
InterviewRouter.patch("/questions/:id/progress", interviewController.updateProgress)
InterviewRouter.get("/stats", interviewController.getStats)
InterviewRouter.get("/companies", interviewController.listCompanies)

export default InterviewRouter
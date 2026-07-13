import Job from "./Jobs.model.js"
import User from "./User.model.js"
import sequelize from "../config/db.js"
import Application from "./application.model.js"
import SavedJob from "./savedJob.model.js"
import Experience from "./experience.model.js"
import Education from "./education.model.js"
import Project from "./project.model.js"
import Resume from "./resume.model.js"
import InterviewQuestion from "./InterviewQuestion.model.js"
import UserQuestionProgress from "./userQuestionProgress.model.js"
import Company from "./company.model.js"
import InterviewSession from "./InterviewSession.model.js"
import InterviewSessionTurn from "./interviewSessionTurn.model.js"

// --- Interview feature associations ---
UserQuestionProgress.belongsTo(InterviewQuestion, {
  foreignKey: "question_id",
  as: "question",
})
InterviewQuestion.hasMany(UserQuestionProgress, {
  foreignKey: "question_id",
  as: "progress",
})

InterviewSession.hasMany(InterviewSessionTurn, {
  foreignKey: "session_id",
  as: "turns",
})
InterviewSessionTurn.belongsTo(InterviewSession, {
  foreignKey: "session_id",
  as: "session",
})

export {
  User,
  Job,
  Application,
  SavedJob,
  Experience,
  Education,
  Project,
  Resume,
  InterviewQuestion,
  UserQuestionProgress,
  Company,
  InterviewSession,
  InterviewSessionTurn,
  sequelize,
}





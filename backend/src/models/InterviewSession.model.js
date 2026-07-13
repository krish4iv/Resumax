import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"

const InterviewSession = sequelize.define(
  "InterviewSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // "system_design" | "behavioral"
    module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // system_design: "Mid" | "Senior" | "Staff+"
    level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ordered array of InterviewQuestion ids chosen for this session
    question_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    // "in_progress" | "completed" | "abandoned"
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "in_progress",
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // per-question breakdown once scored: [{ question_id, score, feedback }]
    result: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "interview_sessions",
    indexes: [{ fields: ["user_id"] }, { fields: ["user_id", "module"] }],
  }
)

export default InterviewSession
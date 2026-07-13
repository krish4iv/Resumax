import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"

const InterviewSessionTurn = sequelize.define(
  "InterviewSessionTurn",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // "assistant" | "user"
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // index into the session's question_ids array this turn relates to
    question_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "interview_session_turns",
    indexes: [{ fields: ["session_id"] }],
  }
)

export default InterviewSessionTurn
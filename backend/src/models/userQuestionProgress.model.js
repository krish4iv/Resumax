import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"

const UserQuestionProgress = sequelize.define(
  "UserQuestionProgress",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Firebase uid — same convention as Resume.user_id
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // "todo" | "attempted" | "solved"
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "todo",
    },
  },
  {
    tableName: "user_question_progress",
    indexes: [
      { unique: true, fields: ["user_id", "question_id"] },
      { fields: ["user_id"] },
    ],
  }
)

export default UserQuestionProgress
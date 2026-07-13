import { DataTypes } from "sequelize"
import sequelize from "../config/db.js"

const InterviewQuestion = sequelize.define(
  "InterviewQuestion",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // "coding" | "system_design" | "behavioral"
    module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // coding: "Arrays & Hashing" pattern name
    // system_design: "Foundational" / "Storage & Infra" etc.
    // behavioral: "Leadership" / "Teamwork & Collaboration" etc.
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // coding: "Easy" | "Medium" | "Hard"
    // system_design: "Mid" | "Senior" | "Staff+"
    // behavioral: usually null, not leveled
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // denormalized array of company slugs, e.g. ["google", "meta"]
    company_tags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    // module-specific extras:
    // coding: { pattern, neetcode150, blind75, leetcode_slug, video_id, premium, free_link }
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "interview_questions",
    indexes: [
      { fields: ["module"] },
      { fields: ["module", "category"] },
      { fields: ["module", "difficulty"] },
    ],
  }
)

export default InterviewQuestion
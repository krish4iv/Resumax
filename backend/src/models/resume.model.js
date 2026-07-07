import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Resume = sequelize.define("Resume", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ats_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  content_quality: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ats_structure: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  job_optimization: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  writing_quality: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  app_ready: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  strengths: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  improvements: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  timestamps: true,
});

export default Resume;
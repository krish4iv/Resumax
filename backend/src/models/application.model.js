import { DataTypes } from "sequelize";

import sequelize from "../config/db.js"

// Fields:
const Application = sequelize.define("Application", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: "User", key: "firebase_uid" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM([
      "applied",
      "interview",
      "offer",
      "rejected",
    ]),
    defaultValue: "applied",
  },
  applied_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Application;

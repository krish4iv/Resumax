import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SavedJob = sequelize.define("SavedJob", {
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
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  salary: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  job_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default SavedJob;
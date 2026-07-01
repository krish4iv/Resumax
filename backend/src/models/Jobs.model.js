import { DataTypes } from "sequelize"

import sequelize from "../config/db.js"

const Job = sequelize.define("Job", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    job_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    source_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    posted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
})

export default Job
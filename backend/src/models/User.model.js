import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define('User',{
   id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    },
   firebase_uid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
    },
   email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
   },
   name :{
    type: DataTypes.STRING,
    allowNull: false
   },
   role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user'
   },
   avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
   },
   skills: {
    type: DataTypes.JSONB,
    defaultValue: []
   },
   preferred_role: {
    type: DataTypes.STRING,
    allowNull: true
   },
   location: {
    type: DataTypes.STRING,
    allowNull: true
   },
   target_companies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
   },
   industries: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
   },
   comp_floor: {
    type: DataTypes.INTEGER,
    allowNull: true
   },
   // --- Onboarding wizard fields ---
   onboarding_goal: {
    // "first_job" | "switch_company" | "level_up" | "big_tech" | "exploring"
    type: DataTypes.STRING,
    allowNull: true
   },
   onboarding_situation: {
    // "employed_interviewing" | "employed_looking" | "searching_fulltime" |
    // "student_new_grad" | "bootcamp" | "switching_into_tech"
    type: DataTypes.STRING,
    allowNull: true
   },
   experience_level: {
    // "intern" | "new_grad" | "1_2_yrs" | "3_5_yrs" | "6_9_yrs" | "10_plus_yrs"
    type: DataTypes.STRING,
    allowNull: true
   },
   craft: {
    // "frontend" | "backend" | "fullstack" | "mobile" | "ml_ai" | "data" |
    // "devops" | "security" | "embedded" | "qa_sdet" | "engineering_manager"
    type: DataTypes.STRING,
    allowNull: true
   },
   onboarding_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
   },
   work_mode: {
    // "remote" | "hybrid" | "onsite"
    type: DataTypes.STRING,
    allowNull: true
   },
   open_to_relocate: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
   },
   work_authorization: {
    // "citizen_or_pr" | "need_sponsorship_now" | "need_sponsorship_later"
    type: DataTypes.STRING,
    allowNull: true
   },
   search_status: {
    // "not_started" | "applying_no_response" | "interviewing_no_offers" | "have_offer"
    type: DataTypes.STRING,
    allowNull: true
   },
   biggest_blocker: {
    // "resume_not_responding" | "cant_find_roles" | "interview_performance" |
    // "feel_underqualified" | "no_time_to_apply"
    type: DataTypes.STRING,
    allowNull: true
   },
   weekly_time_commitment: {
    // "few_hours" | "5_to_15_hours" | "15_plus_hours"
    type: DataTypes.STRING,
    allowNull: true
   },
   github_username: {
    type: DataTypes.STRING,
    allowNull: true
   }
},{
    timestamps: true
})

export default User;
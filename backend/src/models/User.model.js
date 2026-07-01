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
   }
},{
    timestamps: true
})

export default User;
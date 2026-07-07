const Education = sequelize.define("Education", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: "User", key: "firebase_uid" },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  school: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  field: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  timestamps: true,
});
// db/models/role.js
import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Role = sequelize.define(
  "role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { tableName: "roles", timestamps: false },
);

export default Role;

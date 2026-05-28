const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const CashBooks = sequelize.define("checkbook", {
  cashbook_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  project: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currency: {
    type: DataTypes.ENUM,
    values: ["Cash", "Bank"],
  },
  A_C_No: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

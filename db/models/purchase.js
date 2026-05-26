const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Purchase = sequelize.define(
  "purchase",
  {
    PurchaseID: {
      type: DataTypes.STRING,
      allowNull: true,
      primaryKey: true,
    },
    PRCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    RequestorDepartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    EmployeeSign: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    AdminSign: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ChiefAdminManageSign: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ProjectDirectorSign: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    Status: {
      type: DataTypes.STRING,
    },
    timeStamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isOnTheBudget: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mode: {
      type: DataTypes.ENUM,
      values: ["Small Amount", "Service Invoice"],
    },
  },
  {},
);
module.exports = Purchase;

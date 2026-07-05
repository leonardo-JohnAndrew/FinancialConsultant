const { DataTypes } = require("sequelize");
const sequelize = require("../connection");
const { isCancel } = require("axios");

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
    AdminName: {
      type: DataTypes.STRING,
    },
    ChiefAdminManagerName: {
      type: DataTypes.STRING,
    },
    ProjectDirectorName: {
      type: DataTypes.STRING,
      defaultValue: "Jorge Müller",
    },
    Total: {
      type: DataTypes.DECIMAL(18, 2),
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
    isAdminForChiefSign: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCancel: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isRejected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reason: {
      type: DataTypes.STRING,
    },
    id: {
      type: DataTypes.INTEGER,
    },
  },
  {},
);
module.exports = Purchase;

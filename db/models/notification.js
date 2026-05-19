const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Notification = sequelize.define(
  "notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    notification: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {},
);
module.exports = Notification;

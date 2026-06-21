const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Summary = sequelize.define(
  "summary",
  {
    summary_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_name: {
      type: DataTypes.STRING,
      defaultValue: "NSCR",
    },
    project_code: {
      type: DataTypes.STRING,
      defaultValue: "9665R7268",
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {},
);
module.exports = Summary;

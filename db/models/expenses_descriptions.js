const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const ExpensesDescription = sequelize.define(
  "descriptiontypeOfexpenses",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
    },
  },
  {},
);
module.exports = ExpensesDescription;

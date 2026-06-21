const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const AccountCode = sequelize.define(
  "accountcode",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = AccountCode;

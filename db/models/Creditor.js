const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Creditor = sequelize.define(
  "Creditor",
  {
    code: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    creditorsName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "PH",
    },
    tin1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tin2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tin3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "creditors",
    freezeTableName: true,
    timestamps: true,
  },
);

module.exports = Creditor;

const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Supplier = sequelize.define(
  "Supplier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplierAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplierTin: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "suppliers",
    timestamps: true,
  },
);

module.exports = Supplier;

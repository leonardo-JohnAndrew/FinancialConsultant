const { DataTypes } = require("sequelize");
const sequelize = require("../connection");
const PurchaseItems = sequelize.define(
  "purchaseItems",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ItemName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Unit: {
      type: DataTypes.ENUM,
      values: ["bxs", "can", "pcks", "kilo", "btls", "pcs"],
    },
    EndingInventoryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    EndingInventory: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    RequiredBalance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    UnitPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    Total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    Claimable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    TypeOfExpenses: {
      type: DataTypes.STRING,
    },
    Remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {},
);
module.exports = PurchaseItems;

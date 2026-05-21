const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const CheckItem = sequelize.define(
  "checkItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    check_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    payment_voucher_date: {
      type: DataTypes.STRING,
    },
    job: {
      type: DataTypes.STRING,
    },
    payment_item: {
      type: DataTypes.STRING,
    },
    cash: {
      type: DataTypes.INTEGER,
    },
    payee_name: {
      type: DataTypes.STRING,
    },
  },
  {},
);
module.exports = CheckItem;

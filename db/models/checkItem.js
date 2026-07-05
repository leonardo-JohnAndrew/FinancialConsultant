const { DataTypes, DATE } = require("sequelize");
const sequelize = require("../connection");

const CheckItem = sequelize.define(
  "checkItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    slipNo: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0,
    },
    payment_voucher_date: {
      type: DataTypes.STRING,
    },
    job: {
      type: DataTypes.STRING,
      defaultValue: "9665R7268",
    },
    accountCode: {
      type: DataTypes.STRING,
    },

    glCode: {
      type: DataTypes.STRING,
    },
    voucherTypeNumber: {
      type: DataTypes.STRING,
    },
    voucherType: {
      type: DataTypes.ENUM,
      values: ["CASH USD", "BANK USD", "CASH PHP", "BANK PHP"],
      defaultValue: "CASH PHP",
    },
    receiptOrPayment: {
      type: DataTypes.STRING,
    },
    tinNumber: {
      type: DataTypes.STRING,
    },
    payment_voucher_formatted_date: {
      type: DataTypes.STRING,
    },
    payment_voucher_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {},
);
module.exports = CheckItem;

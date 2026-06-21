const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const SummaryDetailed = sequelize.define(
  "summaryDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    summary_id: {
      type: DataTypes.INTEGER,
    },
    item_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currency: {
      type: DataTypes.ENUM,
      values: ["US", "PH"],
      allowNull: true,
    },
    payment_out: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    receipt_in: {
      type: DataTypes.DECIMAL(18, 2),
    },
    total_payment_out: {
      type: DataTypes.DECIMAL(18, 2),
    },
    total_receipt_in: {
      type: DataTypes.DECIMAL(18, 2),
    },
    total_balance: {
      type: DataTypes.DECIMAL(18, 2),
    },
    cash_in_bank: {
      type: DataTypes.DECIMAL(18, 2),
    },
    cash_on_hand: {
      type: DataTypes.DECIMAL(18, 2),
    },
    check_not_shown: {
      type: DataTypes.DECIMAL(18, 2),
    },
    balance_for_next_month: {
      type: DataTypes.DECIMAL(18, 2),
    },
  },
  {},
);
module.exports = SummaryDetailed;

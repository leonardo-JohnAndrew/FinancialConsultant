const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const US_Cash_Bank = sequelize.define(
  "us_cash_bank",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    slipNo: {
      type: DataTypes.INTEGER,
      unique: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    A_C_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_No: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payee_payer_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payee_payer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receipt: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
    },
    payment: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
      defaultValue: 0,
    },
    others: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    glCount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CRM: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Claimable: {
      type: DataTypes.ENUM,
      values: ["Non-Claimable", "Claimable"],
      defaultValue: "Non-Claimable",
    },
    code_invoice_DOTR_1: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    reimbursable_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code_invoice_DOTR_2: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descript_length: {
      type: DataTypes.INTEGER,
    },
  },
  {},
);
module.exports = US_Cash_Bank;

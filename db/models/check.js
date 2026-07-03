const { DataTypes } = require("sequelize");
const sequelize = require("../connection");

const Check = sequelize.define("check", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  checkId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  checkAmount: {
    type: DataTypes.DECIMAL(18, 2),
    defaultValue: 0,
  },

  claimable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ChiefAccountSignature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ChiefAdminSignature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  forApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cheque_attachment: {
    type: DataTypes.STRING,
  },
  isRejected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  Reason: {
    type: DataTypes.STRING,
  },
});
module.exports = Check;

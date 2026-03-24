const {DataTypes} = require('sequelize'); 
const sequelize = require('../connection'); 

const User = sequelize.define('user', { 
  userID: { 
    type : DataTypes.INTEGER, 
    allowNull: false, 
    primaryKey : true, 
    autoIncrement: true 
  }, 
  Username: { 
    type: DataTypes.STRING, 
    allowNull: true, 
  }   
   
}, {}); 
module.exports = User; 
const {DataTypes} = require('sequelize'); 
const sequelize = require('../connection'); 

const User = sequelize.define('user', { 
  userID : {
    type: DataTypes.STRING, 
    allowNull: false, 
    primaryKey: true , 
  }, 
  lastname : {
     type : DataTypes.STRING, 
     allowNull: false, 
  }, 
  firstname : {
     type : DataTypes.STRING, 
     allowNull: false, 
  }, 
  middle : {
     type : DataTypes.STRING, 
     allowNull: true, 
     defaultValue: "N/A" 
  }, 
   department : { 
      type: DataTypes.STRING , 
      allowNull: false
   }, 
   position : {
     type : DataTypes.STRING, 
     allowNull: false 
   }, 
   role : { 
      type : DataTypes.STRING, 
      allowNull: false 
   }, 
   status : { 
     type : DataTypes.ENUM, 
     values: ['Active', 'InActive']
   }, 
   e_signature: { 
     type : DataTypes.STRING, 
     allowNull: true , 
   }, 
   password:{ 
     type : DataTypes.STRING, 
     allowNull : false
   } 
}, {}); module.exports = User; 
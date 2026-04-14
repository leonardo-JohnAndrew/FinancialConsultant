const {DataTypes} = require('sequelize'); 
const sequelize = require('../connection'); 

const Departments = sequelize.define('department', {
    dprtID : { 
        type: DataTypes.INTEGER , 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true
    }, 
    dprtName : { 
        type: DataTypes.STRING , 
        allowNull: false
    }
} , {}) ; 
module.exports  = Departments

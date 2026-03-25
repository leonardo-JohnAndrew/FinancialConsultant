const {DataTypes} = require('sequelize'); 
const sequelize = require('../connection');

const ItemsLists = sequelize.define('itemsLists', { 
    ItemsID: { 
        type : DataTypes.INTEGER, 
        allowNull: false, 
        primaryKey : true, 
        autoIncrement: true 
     }, 
     ItemName: { 
        type: DataTypes.STRING,
        allowNull: true, 
     }, 
     RequiredBalance: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        defaultValue: 0  
      }, 
      UnitPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }, 
      Unit: { 
       type: DataTypes.STRING, 
       allowNull: false,
       defaultValue: 0 
      }
}, {}); 
module.exports = ItemsLists; 
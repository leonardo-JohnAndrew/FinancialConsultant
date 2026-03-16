require('dotenv').config();
const mysql2 = require('mysql2');
const {Sequelize} = require('sequelize'); 

const sequelize = new Sequelize( 
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, 
    { 
        host: process.env.DB_HOST, 
        port: process.env.DB_PORT,
        dialect: 'mysql',
        timezone: '+08:00', 
        dialectModule: mysql2,
        logging: false,
    }
)

module.exports = sequelize;
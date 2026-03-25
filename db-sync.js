const sequelize = require('./db/connection'); 

const {Purchase, PurchaseItems, User, ItemsLists } = require('./db/models/index');
sequelize.sync({alter: true}).then(() => {
    console.log('Database synchronized successfully.');
}).catch((error) => {
    console.error('Error synchronizing database:', error);
});

sequelize.authenticate().then(() => {
    console.log('Database connection established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});
const sequelize = require("./db/connection");

const {
  CashBooks,
  Purchase,
  PurchaseItems,
  ItemsLists,
  SummaryDetailed,
  Check,
  CheckItem,
  PH_Cash_Bank,
  US_Cash_Bank,
} = require("./db/models/index");
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing database:", error);
  });

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

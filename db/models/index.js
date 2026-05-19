import Purchase from "./purchase.js";
import PurchaseItems from "./purchaseItems.js";
import User from "./user.js";
import ItemsLists from "./itemsLists.js";
import Departments from "./department.js";
import BudgetItems from "./budgetItem.js";
import BudgetValue from "./budgetsValue.js";
import Check from "./check.js";
import CheckItem from "./checkItem.js";
import Notification from "./notification.js";

Purchase.hasMany(PurchaseItems, {
  foreignKey: "PurchaseID",
  sourceKey: "PurchaseID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
PurchaseItems.belongsTo(Purchase, {
  foreignKey: "PurchaseID",
  targetKey: "PurchaseID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(Purchase, {
  foreignKey: "UserID",
  sourceKey: "userID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Purchase.belongsTo(User, {
  foreignKey: "UserID",
  targetKey: "userID",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
// BUDGET ITEM SELF JOIN
BudgetItems.hasMany(BudgetItems, {
  as: "children",
  foreignKey: "parent_id",
});

BudgetItems.belongsTo(BudgetItems, {
  as: "parent",
  foreignKey: "parent_id",
});

// 1 - 1 BudgetsItem -> BudgetValue

BudgetItems.hasOne(BudgetValue, {
  foreignKey: "budget_item_id",
  as: "values",
});

BudgetValue.belongsTo(BudgetItems, {
  foreignKey: "budget_item_id",
});

// check -> checkItems
Check.hasMany(CheckItem, {
  foreignKey: "check_id",
  as: "items",
});
CheckItem.belongsTo(Check, {
  foreignKey: "check_id",
  as: "check",
});
//self join
CheckItem.hasMany(CheckItem, {
  foreignKey: "parent_id",
  as: "children",
});
CheckItem.belongsTo(CheckItem, {
  foreignKey: "parent_id",
  as: "parent",
});
export {
  Purchase,
  PurchaseItems,
  User,
  Check,
  CheckItem,
  ItemsLists,
  BudgetItems,
  BudgetValue,
  Notification,
};

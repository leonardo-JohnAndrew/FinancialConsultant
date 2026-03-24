import Purchase from "./purchase.js";
import PurchaseItems from "./purchaseItems.js";
import User from "./user.js";
Purchase.hasMany(PurchaseItems, { 
    foreignKey: 'PurchaseID', 
    sourceKey: 'PurchaseID', 
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
}); 
PurchaseItems.belongsTo(Purchase, { 
    foreignKey: 'PurchaseID', 
    targetKey: 'PurchaseID', 
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
});
User.hasMany(Purchase, { 
    foreignKey: 'UserID', 
    sourceKey: 'userID', 
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
});
Purchase.belongsTo(User, { 
    foreignKey: 'UserID', 
    targetKey: 'userID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
export { 
    Purchase, 
    PurchaseItems, 
    User 
}
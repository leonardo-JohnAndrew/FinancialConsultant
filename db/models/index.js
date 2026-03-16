import Purchase from "./purchase.js";
import PurchaseItems from "./purchaseItems.js";
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

export { 
    Purchase, 
    PurchaseItems
}
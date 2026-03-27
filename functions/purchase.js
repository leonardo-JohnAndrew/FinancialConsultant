import crypto from 'crypto'; 

export function generatePurchaseId(){
    const prefix = "NSCR"; 
    const type = "PR";  
    const year = new Date().getFullYear();  
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${type}-${year}-${randomString}`;
}

 export function getItemInfo( item_id , items){ 
    const requiredBalance = items.find(item => item.ItemsID === item_id)?.RequiredBalance || 0;
    const unitPrice = items.find(item => item.ItemsID === item_id)?.UnitPrice || 0;
    const unit = items.find(item => item.ItemsID === item_id)?.Unit || " ";
    return { 
        requiredBalance, 
        unitPrice, 
        unit 
    }
} 

export function calculateQuantity(requiredBalance, endingInventory){
    const quantity = requiredBalance - endingInventory; 
    return quantity > 0 ? quantity : 0;
}

//matching the item id with the item info to get the required balance, unit price, and unit for the purchase submit table
//if item is found return the required balance, unit price, and unit, otherwise return 0 for required balance and unit price, and empty string for unit
export function getItemInfoForPurchaseSubmit(itemsID, items){
/* 
   itemsID = ['11','13']
   items = [
0: {ItemRequiredBalance: 0, ItemUnitPrice: 0, EndingInventory: 0, ItemQuantity: 0, ItemTotal: 0, …},
1: {ItemRequiredBalance: 90, ItemUnitPrice: 300, EndingInventory: 0, ItemQuantity: 90, ItemTotal: 27000, …},
2: undefined,
3: undefined,
4: undefined,
5: undefined,
6: undefined,
7: undefined,
8: undefined,
9: undefined,
10:undefined,
11:{ItemRequiredBalance: 3, ItemUnitPrice: 500, EndingInventory: 2, ItemQuantity: 1, ItemTotal: 500},
12:undefined,
13:{ItemRequiredBalance: 25, ItemUnitPrice: 150, EndingInventory: 2, ItemQuantity: 23, ItemTotal: 3450},
]
*/

    return itemsID.map(id => {
        const item = items.find(item => item.ItemsID === Number(id));
        return {
            ItemRequiredBalance: item ? item.ItemRequiredBalance : 0,
            ItemUnitPrice: item ? item.ItemUnitPrice : 0,
            EndingInventory: item ? item.EndingInventory : 0,
            ItemQuantity: item ? item.ItemQuantity : 0,
            ItemTotal: item ? item.ItemTotal : 0
        }
    });
}
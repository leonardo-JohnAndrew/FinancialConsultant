import crypto from 'crypto'; 

export function generatePurchaseId(){
    const prefix = "NSCR"; 
    const type = "PR";  
    const year = new Date().getFullYear();  
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${type}-${year}-${randomString}`;
}

 export async function getItemInfo( item_id , items){ 
    const requiredBalance = items.find(item => item.ItemsID === item_id)?.RequiredBalance || 0;
    const unitPrice = items.find(item => item.ItemsID === item_id)?.UnitPrice || " ";
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
import { PurchaseItems } from "@/db/models";
import { ExportExcelFile } from "@/functions/excel";

export async function GET(params) {  
    return  await ExportExcelFile([
     'id', 
     'ItemName', 
     'Unit', 
     'EndingInventoryDate',
     'EndingInventory', 
     'RequiredBalance', 
     'Quantity', 
     'UnitPrice', 
     'Total',
     'PurchaseID'
    ], 
    PurchaseItems, 
    "PurchaseItem"
)

}
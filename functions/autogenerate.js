import { User } from "@/db/models";
import crypto from "crypto"
//purchase id
export function generatePurchaseId(){
    const prefix = "NSCR"; 
    const type = "PR";  
    const year = new Date().getFullYear();  
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${type}-${year}-${randomString}`;
}

export async function generatUserID(lastname){ 
    // get latest count 
     const userCount = await User.count();
     return `${lastname} - ${userCount}`
}

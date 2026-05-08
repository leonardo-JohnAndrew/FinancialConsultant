import { BudgetItems , BudgetValue } from "@/db/models";
import { NextResponse } from "next/server";

export async function GET(request) {
    try{ 
        const items = await BudgetItems.findAll({
         where: { parent_id: null },
         include: [
           {
             model: BudgetItems,
             as: "children",
             include: [
               {
                 model: BudgetItems,
                 as: "children",
               },
               {
                 model: BudgetValue,
                 as: "values",
               },
             ],
           },
           {
             model: BudgetValue,
             as: "values",
           },
         ],
       });

       return NextResponse.json({items}, {status: 200})
    }catch(error){ 
        return NextResponse.json({error_message: error.message}, {status: 500 })
    }
}

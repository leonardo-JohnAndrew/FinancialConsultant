import { ItemsLists, PurchaseItems } from "@/db/models";
import { NextResponse } from "next/server";
import { Sequelize } from "sequelize";

//GET REQUEST
export async function GET(){
  try {
    //Get 
    const unit = await ItemsLists.findAll({
     attributes: [ 
       [Sequelize.fn('DISTINCT',Sequelize.col("Unit")), 'Unit']
     ], 
     raw: true
    })

    
      return NextResponse.json({Unit: unit || []},{status:200})
  }catch(error){
      return NextResponse.json({error_message:error.message}, {status: 500})
  }
}
//Unique  ItemDescription  


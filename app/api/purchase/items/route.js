import sequelize from "@/db/connection"; 
import { ItemsLists } from "@/db/models"; 
import { validationRequiredFields } from "@/functions/validations";
import { NextResponse } from "next/server"; 

//GET All 
export async function GET(){ 
    try{ 
        await sequelize.sync();
        const items = await ItemsLists.findAll(); 
         return NextResponse.json({items}, {status: 200}); 
    }catch(error){ 
      return NextResponse.json(
        {message: "Internal Server Error", error: error.message}
      )
    }
}

// ADD New Item 
export async function POST(request){
   //validations
     
   const validation =  await validationRequiredFields(['itemName', 'RequiredBalance', 'UnitPrice', 'Unit'], [{ItemName: 'Tissue'}, {ItemName: 'Domex'}]); 
   return NextResponse.json(
    {validation},
     {status:201}
    )
     
    try{ 
        
        await sequelize.sync(); 
        const body = await request.json(); 
        const newItem = await ItemsLists.create(body); 
         return NextResponse.json({newItem}, {status: 201}); 
    }catch(error){
      return NextResponse.json(
        {message: "Internal Server Error", error: error.message}
      )
     }  
}
/*


*/
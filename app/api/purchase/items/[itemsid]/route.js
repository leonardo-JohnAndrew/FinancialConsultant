import sequelize from "@/db/connection";  
import {ItemsLists} from "@/db/models"; 
import { NextResponse } from "next/server"; 

export async function GET(request, {params}){ 
    try{ 
        await sequelize.sync(); 
        const { itemsid } = await params;
        const items = await  ItemsLists.findByPk(itemsid);  
         return NextResponse.json({itemInfo: items}, {status: 200}); 
    }catch(error){ 
      return NextResponse.json(
        {message: "Internal Server Error", error: error.message}
      )
     }  
}

export async function POST(request, {params}) {
    try {
        await sequelize.sync();
        const { itemsid } = await params;
        const body = await request.json();
        const updatedItems = await ItemsLists.update(body, {
            where: { ItemsID: itemsid }
        });
        return NextResponse.json({ itemInfo: updatedItems }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
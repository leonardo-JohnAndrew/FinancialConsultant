import { User } from "@/db/models";
import { NextResponse } from "next/server";



// Get Function 
export async function GET(request, {params}) {
    try{ 
       const {userid} = await params;  
       const user = await User.findByPk(userid); 
       if(user){ 
           return NextResponse.json({userInfo: user}, {status: 201})
       }else{ 
         return NextResponse.json({error_message: "Something went Wrong"} , {status: 500})
        }
    }catch(error){ 
        return NextResponse.json({error_message:error.message} , {status: 500})
    }
}

export async function PATCH(request ,{params}) {
    try {
       const {userid} = await params; 
       const formData = await request.formData(); 
       const body = Object.fromEntries(formData.entries()); 

       const file  = formData.get("profile_pic"); 
       let imagePath = null 

       if(file && file.name){ 
        const bytes = await file.arrayBuffer(); 
        const buffer = Buffer.from(bytes); 
        
        const fileName = `${Date.now()}-${file.name}`; 
        const path = `./public/uploads/${fileName}`;

        const fs = require("fs");
        fs.writeFileSync(path, buffer);

        imagePath = `/uploads/${fileName}`;

         
        return NextResponse.json({message: fileName} , {status: 200})
    
       }

    }catch(error){ 
       return NextResponse.json({error_message: error.message} , {status: 500})
    }
}
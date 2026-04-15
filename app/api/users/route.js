import sequelize from "@/db/connection";
import { User } from "@/db/models";
import { validationRequiredFields } from "@/functions/validations";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"
import { error } from "node:console";
import { generatUserID } from "@/functions/autogenerate";

// post 
export async function  POST(request) {
    await sequelize.sync(); 

    const requiredFields = [ 
    'lastname', 
    'firstname', 
    'department', 
    'position',
    'role', 
    'status', 
    'password'
    ]; 
    const body = await request.json(); 

    const validation =  await validationRequiredFields(requiredFields, body.users); 
    console.log(validation)
    if(validation && Object.keys(validation).length>0 ) { 
        return NextResponse.json({error_message: validation} , {status: 400}); 
    }
  
    try {
        // hashing password set userId 
        const salt = 10 ; 
        const user = body.users[0]; 
        const userID = await generatUserID(user.lastname); 
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
      //  save account to database 
        const created  = await User.create({ 
            ...user, 
            password: hashedPassword, 
            userID:userID
        })
     
        if(created && Object.keys(created).length>0){ 
            return NextResponse.json({created:  created}, {status: 200})
        }else{ 
            return NextResponse.json({error_message : 'Something Wrong'}, {status: 500})
        }
        
    } catch (error) {
       return NextResponse.json({error_message: error.mess}, {status: 500}) 
   }

}

// Get 
export async function GET() {
    try{ 
      const users = await User.findAll(); 
      return NextResponse.json({users}, {status: 200}); 
    }catch(error){ 
        return NextResponse.json(
            { error_message : error.message}
        )
    }
}
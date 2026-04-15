import { generatUserID } from "@/functions/autogenerate";
import { validationRequiredFields } from "@/functions/validations";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx"; 
import bcrypt from "bcrypt"
import { error } from "node:console";
import { User } from "@/db/models";
export async function POST(request) {

     const requiredFields = [ 
    'lastname', 
    'firstname', 
    'department', 
    'position',
    'role', 
    'status', 
    'password'
    ]; 

    try{ 
        const formData = await request.formData(); 
        const file = formData.get("file"); 
        
        if(!file){ 
            return NextResponse.json({error_message : "No file upload"}, {status: 400}); 
        }
        const buffer = Buffer.from(await file.arrayBuffer()); 
        const workbook = XLSX.read(buffer, {type: "buffer"}); 
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; 
        const jsonData = XLSX.utils.sheet_to_json(sheet); 
        
        const validation  = await validationRequiredFields(requiredFields , jsonData)
        console.log(validation)
        if(validation && Object.keys(validation).length>0 ) { 
            return NextResponse.json({error_message: validation} , {status: 400}); 
        }
               
        const count = await User.count(); 
        let idNUm = count === 0 ? 1 : count 

        const salt = 10 ; 
        const  user = await Promise.all(
            jsonData.map(async(row)=>({ 
                userID: `${row.lastname} - ${idNUm++} `, 
                lastname: row.lastname,
                firstname: row.firstname, 
                middle: row.middle, 
                department: row.department, 
                position: row.position, 
                role: row.role, 
                status: row.status || "Active", 
                password: await bcrypt.hash(row.password, salt)
                
            }))
        )
           const saveAccounts =  await User.bulkCreate(user , { 
            validate: true, 
            ignoreDuplicates: true, 
           })
         
        if(user.length > 0){ 
            return NextResponse.json({message: saveAccounts}, {status: 201}); 
        }else{
            return NextResponse.json({error_message: "Something went Wromg"}, {status: 500}); 

        }
    }catch(error){ 
        return NextResponse.json({error_message: error.message || JSON.stringify(Error)}, {status: 500})
    }
}
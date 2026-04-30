import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; 
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";
import { User } from "@/db/models";


export async function POST(request) {
    try { 
        const body = await request.json(); 
        const {userID , password}  = body
 
        if(!userID || !password){ 
            return NextResponse.json({ 
                error_message : "Missing credentials"
            }, { status: 400}); 
        }
        
        //find account in db 
        const userAccount = await User.findByPk(userID); 
        
        
        if(!userAccount) {
            return NextResponse.json({error_message: "Invalid credentials"}, 
                {status: 401}
            ); 
        }
        
        // password hash compared 
        const isMatch = await  bcrypt.compare(password,userAccount.password); 
        if(!isMatch){
            return NextResponse.json({
                error_message : "Invalid credential"
            }, {status: 401}); 
        }
        console.log(body); 
        // create token 
       const token = await signToken({
         id: userAccount.userID,
         userID: userAccount.userID,
         role: userAccount.role,
         profile: userAccount.profile_pic, 
         department: userAccount.department, 
         e_sign : userAccount.e_signature, 
         name: `${userAccount.lastname}, ${userAccount.firstname} ${!userAccount.middle || userAccount.middle === 'N/A' || userAccount.middle === null? "": userAccount.middle}`
       });
    
        // store in cookie 
        (await cookies()).set(`token`, token, {
            httpOnly: true, 
            secure : process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            maxAge: 60 * 60, 
            path: "/", 
        }); 

        return NextResponse.json({
            message: "Login successful", 
            user: {
                userID: userAccount.userID, 
                role: userAccount.role
            }, 
        }); 
    }catch(error){ 
        return NextResponse.json({error_message: error.message} ,{status: 500})
    }
}
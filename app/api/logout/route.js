import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try{
    (await cookies()).set("token", "", { 
        httpOnly: true, 
        expires: new Date(0),
        path: "/", 
    });

    return NextResponse.json({
        message: "Logged out successfully"
    }); 
    }catch(error){ 
     return NextResponse.json({error_message : error.message}, {status: 500}); 
    }
}
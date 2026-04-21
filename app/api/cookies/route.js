import { signToken } from "@/lib/auth";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
export async function GET(req) {
   try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL("/Login", req.url));
    }
    
    const { payload } = await jwtVerify(token, secret);
    return Response.json(payload);
} catch (err) {
      return NextResponse.redirect(new URL("/Login", req.url));
    // return Response.json(err.message, { status: 401 });
  }
}
export async function POST(request) {
    const body = await request.json(); 

    // validate 
    const newPayload = { 
        id: body.id , 
        role: body.role
    }
    
    try{
       await signToken(newPayload); 
    }catch(err){
        return Response.json({error: err.message}, {status: 500})
    }
}

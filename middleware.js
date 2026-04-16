import { NextResponse  } from "next/server";

export function middleware(request) {
    const {pathname} = request.nextUrl; 
   // public api 
    

 // protected api 
 // Get token from cookies
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try{
        
        return NextResponse.next();
    }catch(error){ 
       if(!pathname.startsWith("/api")){
        return NextResponse.redirect(new URL("/login", request.url)); 
       }
       return NextResponse.json({error_message: "Unauthorized"}, {status: 401});
    }

}

export const config = {
   matcher : ["/api/user/:path*"]
}
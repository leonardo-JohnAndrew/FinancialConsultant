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

    if (token !== process.env.JWT_SECRET) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
   matcher : [
   ]
}
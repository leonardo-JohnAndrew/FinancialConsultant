import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  console.log("TOKEN:", token);

  if (!token) {
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/Login", request.url));
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch (error) {
   // console.log("VERIFY ERROR:", error.message);
     if(!pathname.startsWith("/api")){ 
        return NextResponse.redirect(new URL("/Login", request.url)); 
     }
     return NextResponse.json(
      { error_message: error.message },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*", "/Main/:path*"],
};
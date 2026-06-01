import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  // Public auth routes
  if (pathname.startsWith("/api/login") || pathname.startsWith("/api/cookie")) {
    return NextResponse.next();
  }

  // USER REGISTRATION: only POST allowed, NO AUTH CHECK
  if (pathname.startsWith("/api/users") && request.method === "POST") {
    return NextResponse.next(); // IMPORTANT: stop here (no token check)
  }

  // Everything else requires token
  const token = request.cookies.get("token")?.value;

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
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/Login", request.url));
    }
    return NextResponse.json({ error_message: error.message }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*", "/Main/:path*"],
};

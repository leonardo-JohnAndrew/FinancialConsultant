import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";
import { getAllowedPaths } from "./functions/menus";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/cookies")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/users") && request.method === "POST") {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/Login", request.url));
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);

    const isApiRoute = pathname.startsWith("/api");
    const isUserProfile = pathname.startsWith("/Main/Profile");

    // ── E-SIGN GUARD ─────────────────────────────────────────────
    const hasEsign = decoded.e_sign && decoded.e_sign.trim() !== "";
    if (!hasEsign && !isUserProfile && !isApiRoute) {
      return NextResponse.redirect(new URL("/Main/Profile", request.url));
    }

    // ── MUST CHANGE PASSWORD GUARD ───────────────────────────────
    const mustChange =
      decoded.mustChangePassword === true || decoded.mustChangePassword === 1;
    if (mustChange && !isUserProfile && !isApiRoute) {
      return NextResponse.redirect(
        new URL("/Main/Profile?setup=true", request.url),
      );
    }

    // ── ROLE-BASED PAGE GUARD ─────────────────────────────────────
    if (pathname.startsWith("/Main") && !isUserProfile) {
      const allowedPaths = getAllowedPaths(decoded.role);
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/Main/Home", request.url));
      }
    }

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

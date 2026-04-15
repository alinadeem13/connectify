import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "connectify_session";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (!token && (pathname === "/" || pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

const token = request.cookies.get("token")?.value;

// if (!token && request.nextUrl.pathname == "/") {
//   return NextResponse.redirect(new URL("/login", request.url));
// }
// else if (token && request.nextUrl.pathname == "/login") {
//   return NextResponse.redirect(new URL("/", request.url));
// }




    return NextResponse.next();
}
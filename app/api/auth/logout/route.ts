import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.json({ message: "Logged out." });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

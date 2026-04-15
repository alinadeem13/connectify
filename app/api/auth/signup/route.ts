import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { readDb, writeDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role;
  const password = body.password;

  if (!name || !email || !role || !password) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  const db = await readDb();
  const existingUser = db.users.find((user) => user.email === email);

  if (existingUser) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const username = email.split("@")[0];
  const user = {
    id: randomUUID(),
    name,
    email,
    username,
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeDb(db);

  const token = await createSession(user.id);
  const response = NextResponse.json({ message: "Signup successful." }, { status: 201 });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

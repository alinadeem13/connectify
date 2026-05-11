import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { uploadImageToAzure } from "@/lib/azure-storage";
import { signupSchema } from "@/lib/validations";

export const runtime = "nodejs";

async function parseSignupRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return {
      body: await request.json(),
      avatarFile: null,
    };
  }

  const formData = await request.formData();
  const avatar = formData.get("avatar");

  return {
    body: {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      password: formData.get("password"),
    },
    avatarFile: avatar instanceof File && avatar.size > 0 ? avatar : null,
  };
}

export async function POST(request: Request) {
  const { body, avatarFile } = await parseSignupRequest(request);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid signup data." }, { status: 400 });
  }

  const pool = await getSqlPool();
  const { name, email, role, password } = parsed.data;

  const existingUserResult = await pool
    .request()
    .input("email", sql.NVarChar(255), email)
    .query<{ id: string }>("SELECT TOP 1 id FROM dbo.users WHERE email = @email");
  const existingUser = existingUserResult.recordset[0];

  if (existingUser) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const usernameBase = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  const username = `${usernameBase}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = randomUUID();
  const avatarUpload = avatarFile ? await uploadImageToAzure(avatarFile, "avatars") : null;

  await pool
    .request()
    .input("id", sql.NVarChar(64), userId)
    .input("name", sql.NVarChar(255), name)
    .input("email", sql.NVarChar(255), email)
    .input("username", sql.NVarChar(255), username)
    .input("role", sql.NVarChar(20), role)
    .input("passwordHash", sql.NVarChar(255), hashPassword(password))
    .input("avatarUrl", sql.NVarChar(1000), avatarUpload?.imageUrl ?? null)
    .input("avatarStoragePath", sql.NVarChar(1000), avatarUpload?.storagePath ?? null)
    .query(`
      INSERT INTO dbo.users (id, name, email, username, role, password_hash, avatar_url, avatar_storage_path)
      VALUES (@id, @name, @email, @username, @role, @passwordHash, @avatarUrl, @avatarStoragePath)
    `);

  let token: string;
  try {
    token = await createSession(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create session.";
    return NextResponse.json({ message }, { status: 500 });
  }
  const response = NextResponse.json({ message: "Signup successful." }, { status: 201 });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

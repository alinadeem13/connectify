import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { updateProfileSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      avatarStoragePath: user.avatarStoragePath,
      createdAt: user.createdAt,
    },
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid profile data." }, { status: 400 });
  }

  const pool = await getSqlPool();
  const { name, username } = parsed.data;

  const existingUserResult = await pool
    .request()
    .input("username", sql.NVarChar(255), username)
    .input("userId", sql.NVarChar(64), user.id)
    .query<{ id: string }>("SELECT TOP 1 id FROM dbo.users WHERE username = @username AND id <> @userId");
  const existingUser = existingUserResult.recordset[0];

  if (existingUser) {
    return NextResponse.json({ message: "That username is already taken." }, { status: 409 });
  }

  const updateResult = await pool
    .request()
    .input("name", sql.NVarChar(255), name)
    .input("username", sql.NVarChar(255), username)
    .input("userId", sql.NVarChar(64), user.id)
    .query<{
      id: string;
      name: string;
      email: string;
      username: string;
      role: "creator" | "consumer";
      avatar_url: string | null;
      avatar_storage_path: string | null;
      created_at: Date;
    }>(`
      UPDATE dbo.users
      SET name = @name, username = @username
      OUTPUT inserted.id, inserted.name, inserted.email, inserted.username, inserted.role, inserted.avatar_url, inserted.avatar_storage_path, inserted.created_at
      WHERE id = @userId
    `);
  const updatedUser = updateResult.recordset[0];

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatar_url,
      avatarStoragePath: updatedUser.avatar_storage_path,
      createdAt: updatedUser.created_at.toISOString(),
    },
  });
}

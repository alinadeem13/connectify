import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { User } from "@/lib/types";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hashedPassword] = storedHash.split(":");
  const passwordBuffer = scryptSync(password, salt, 64);
  const hashedBuffer = Buffer.from(hashedPassword, "hex");
  return timingSafeEqual(passwordBuffer, hashedBuffer);
}

export async function createSession(userId: string) {
  const pool = await getSqlPool();
  const token = randomUUID();

  await pool.request().input("userId", sql.NVarChar(64), userId).query("DELETE FROM dbo.sessions WHERE user_id = @userId");

  await pool
    .request()
    .input("token", sql.NVarChar(64), token)
    .input("userId", sql.NVarChar(64), userId)
    .query("INSERT INTO dbo.sessions (token, user_id) VALUES (@token, @userId)");

  return token;
}

export async function deleteSession(token: string) {
  const pool = await getSqlPool();
  await pool.request().input("token", sql.NVarChar(64), token).query("DELETE FROM dbo.sessions WHERE token = @token");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const pool = await getSqlPool();
  const sessionResult = await pool
    .request()
    .input("token", sql.NVarChar(64), token)
    .query<{ token: string; user_id: string }>("SELECT TOP 1 token, user_id FROM dbo.sessions WHERE token = @token");

  const session = sessionResult.recordset[0];
  if (!session) {
    return null;
  }

  const userResult = await pool
    .request()
    .input("userId", sql.NVarChar(64), session.user_id)
    .query<{
      id: string;
      name: string;
      email: string;
      username: string;
      role: "creator" | "consumer";
      password_hash: string;
      avatar_url: string | null;
      avatar_storage_path: string | null;
      created_at: Date;
    }>("SELECT TOP 1 id, name, email, username, role, password_hash, avatar_url, avatar_storage_path, created_at FROM dbo.users WHERE id = @userId");

  const user = userResult.recordset[0];
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    passwordHash: user.password_hash,
    avatarUrl: user.avatar_url,
    avatarStoragePath: user.avatar_storage_path,
    createdAt: user.created_at.toISOString(),
  };
}

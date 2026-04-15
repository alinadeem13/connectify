import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { readDb, writeDb } from "@/lib/db";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
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
  const db = await readDb();
  const token = randomUUID();

  db.sessions = db.sessions.filter((session) => session.userId !== userId);
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });

  await writeDb(db);
  return token;
}

export async function deleteSession(token: string) {
  const db = await readDb();
  db.sessions = db.sessions.filter((session) => session.token !== token);
  await writeDb(db);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) return null;

  return db.users.find((user) => user.id === session.userId) ?? null;
}

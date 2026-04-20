import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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
  const supabase = createSupabaseServerClient();
  const token = randomUUID();

  await supabase.from("sessions").delete().eq("user_id", userId);

  const { error } = await supabase.from("sessions").insert({
    token,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return token;
}

export async function deleteSession(token: string) {
  const supabase = createSupabaseServerClient();
  await supabase.from("sessions").delete().eq("token", token);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const supabase = createSupabaseServerClient();
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("token, user_id")
    .eq("token", token)
    .maybeSingle();

  if (sessionError || !session) {
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, email, username, role, password_hash, created_at")
    .eq("id", session.user_id)
    .maybeSingle();

  if (userError || !user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    passwordHash: user.password_hash,
    createdAt: user.created_at,
  };
}

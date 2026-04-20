import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
import { signupSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid signup data." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { name, email, role, password } = parsed.data;

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError) {
    return NextResponse.json({ message: getSupabaseErrorMessage(existingUserError.message) }, { status: 500 });
  }

  if (existingUser) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const usernameBase = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  const username = `${usernameBase}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = randomUUID();

  const { error: insertError } = await supabase.from("users").insert({
    id: userId,
    name,
    email,
    username,
    role,
    password_hash: hashPassword(password),
  });

  if (insertError) {
    return NextResponse.json({ message: getSupabaseErrorMessage(insertError.message) }, { status: 500 });
  }

  let token: string;
  try {
    token = await createSession(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create session.";
    return NextResponse.json({ message: getSupabaseErrorMessage(message) }, { status: 500 });
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

import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
import { loginSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid login data." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { email, password } = parsed.data;

  const { data: user, error } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: getSupabaseErrorMessage(error.message) }, { status: 500 });
  }

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSession(user.id);
  } catch (sessionError) {
    const message = sessionError instanceof Error ? sessionError.message : "Unable to create session.";
    return NextResponse.json({ message: getSupabaseErrorMessage(message) }, { status: 500 });
  }
  const response = NextResponse.json({ message: "Login successful." });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

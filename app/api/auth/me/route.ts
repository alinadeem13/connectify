import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
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

  const supabase = createSupabaseServerClient();
  const { name, username } = parsed.data;

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existingUserError) {
    return NextResponse.json({ message: getSupabaseErrorMessage(existingUserError.message) }, { status: 500 });
  }

  if (existingUser) {
    return NextResponse.json({ message: "That username is already taken." }, { status: 409 });
  }

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({ name, username })
    .eq("id", user.id)
    .select("id, name, email, username, role, created_at")
    .single();

  if (updateError) {
    return NextResponse.json({ message: getSupabaseErrorMessage(updateError.message) }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
    },
  });
}

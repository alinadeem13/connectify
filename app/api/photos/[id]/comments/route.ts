import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hydratePosts } from "@/lib/photo";
import { createCommentSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid comment." }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseServerClient();

  const { data: photo, error: photoError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (photoError) {
    return NextResponse.json({ message: photoError.message }, { status: 500 });
  }

  if (!photo) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  const { error: commentError } = await supabase.from("comments").insert({
    id: randomUUID(),
    text: parsed.data.text,
    post_id: id,
    user_id: user.id,
  });

  if (commentError) {
    return NextResponse.json({ message: commentError.message }, { status: 500 });
  }

  const { data: photoRows, error: fetchError } = await supabase
    .from("posts")
    .select("id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id, created_at")
    .eq("id", id);

  if (fetchError || !photoRows || photoRows.length === 0) {
    return NextResponse.json({ message: fetchError?.message ?? "Photo not found." }, { status: 500 });
  }

  const [updatedPost] = await hydratePosts(photoRows);
  return NextResponse.json({ photo: updatedPost, post: updatedPost });
}

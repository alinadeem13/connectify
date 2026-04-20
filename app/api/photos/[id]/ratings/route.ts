import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hydratePosts } from "@/lib/photo";
import { createRatingSchema } from "@/lib/validations";

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
  const parsed = createRatingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid rating." }, { status: 400 });
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

  const { data: existingRating, error: existingRatingError } = await supabase
    .from("ratings")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingRatingError) {
    return NextResponse.json({ message: existingRatingError.message }, { status: 500 });
  }

  if (existingRating) {
    const { error: updateError } = await supabase
      .from("ratings")
      .update({ value: parsed.data.value })
      .eq("id", existingRating.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase.from("ratings").insert({
      id: randomUUID(),
      value: parsed.data.value,
      post_id: id,
      user_id: user.id,
    });

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }
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

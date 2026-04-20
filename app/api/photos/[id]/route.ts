import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hydratePosts } from "@/lib/photo";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id, created_at")
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  const [post] = await hydratePosts(data);
  return NextResponse.json({ photo: post, post });
}

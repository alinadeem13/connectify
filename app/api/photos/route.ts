import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hydratePosts } from "@/lib/photo";
import { createPhotoSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const location = searchParams.get("location")?.trim();
  const person = searchParams.get("person")?.trim();

  let dbQuery = supabase
    .from("posts")
    .select("id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id, created_at")
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,caption.ilike.%${query}%`);
  }

  if (location) {
    dbQuery = dbQuery.ilike("location", `%${location}%`);
  }

  if (person) {
    dbQuery = dbQuery.contains("people_present", [person]);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const posts = await hydratePosts(data ?? []);
  return NextResponse.json({ photos: posts, posts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (user.role !== "creator") {
    return NextResponse.json({ message: "Only creators can publish photos." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createPhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid photo data." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const photoId = randomUUID();

  const { error: insertError } = await supabase.from("posts").insert({
    id: photoId,
    title: parsed.data.title,
    caption: parsed.data.caption,
    location: parsed.data.location,
    people_present: parsed.data.peoplePresent,
    image_url: parsed.data.imageUrl,
    storage_path: parsed.data.storagePath,
    uploaded_by_id: user.id,
  });

  if (insertError) {
    return NextResponse.json({ message: insertError.message }, { status: 500 });
  }

  const { data: photoRows, error: fetchError } = await supabase
    .from("posts")
    .select("id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id, created_at")
    .eq("id", photoId);

  if (fetchError || !photoRows || photoRows.length === 0) {
    return NextResponse.json({ message: fetchError?.message ?? "Photo could not be loaded." }, { status: 500 });
  }

  const [post] = await hydratePosts(photoRows);
  return NextResponse.json({ photo: post, post }, { status: 201 });
}

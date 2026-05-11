import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { getPhotoFeedRows, getPostRowsById, hydratePosts } from "@/lib/photo";
import { createPhotoSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const location = searchParams.get("location")?.trim();
  const person = searchParams.get("person")?.trim();

  const data = await getPhotoFeedRows({ query, location, person });
  const posts = await hydratePosts(data);
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

  const pool = await getSqlPool();
  const photoId = randomUUID();

  await pool
    .request()
    .input("id", sql.NVarChar(64), photoId)
    .input("title", sql.NVarChar(255), parsed.data.title)
    .input("caption", sql.NVarChar(sql.MAX), parsed.data.caption)
    .input("location", sql.NVarChar(255), parsed.data.location)
    .input("peoplePresent", sql.NVarChar(sql.MAX), JSON.stringify(parsed.data.peoplePresent))
    .input("imageUrl", sql.NVarChar(1000), parsed.data.imageUrl)
    .input("storagePath", sql.NVarChar(1000), parsed.data.storagePath)
    .input("uploadedById", sql.NVarChar(64), user.id)
    .query(`
      INSERT INTO dbo.posts (id, title, caption, location, people_present, image_url, storage_path, uploaded_by_id)
      VALUES (@id, @title, @caption, @location, @peoplePresent, @imageUrl, @storagePath, @uploadedById)
    `);

  const photoRows = await getPostRowsById(photoId);
  if (photoRows.length === 0) {
    return NextResponse.json({ message: "Photo could not be loaded." }, { status: 500 });
  }

  const [post] = await hydratePosts(photoRows);
  return NextResponse.json({ photo: post, post }, { status: 201 });
}

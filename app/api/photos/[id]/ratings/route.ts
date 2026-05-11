import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { getPostRowsById, hydratePosts, postExists } from "@/lib/photo";
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
  const pool = await getSqlPool();

  if (!(await postExists(id))) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  const existingRatingResult = await pool
    .request()
    .input("postId", sql.NVarChar(64), id)
    .input("userId", sql.NVarChar(64), user.id)
    .query<{ id: string }>("SELECT TOP 1 id FROM dbo.ratings WHERE post_id = @postId AND user_id = @userId");
  const existingRating = existingRatingResult.recordset[0];

  if (existingRating) {
    await pool
      .request()
      .input("id", sql.NVarChar(64), existingRating.id)
      .input("value", sql.Int, parsed.data.value)
      .query("UPDATE dbo.ratings SET value = @value WHERE id = @id");
  } else {
    await pool
      .request()
      .input("id", sql.NVarChar(64), randomUUID())
      .input("value", sql.Int, parsed.data.value)
      .input("postId", sql.NVarChar(64), id)
      .input("userId", sql.NVarChar(64), user.id)
      .query("INSERT INTO dbo.ratings (id, value, post_id, user_id) VALUES (@id, @value, @postId, @userId)");
  }

  const photoRows = await getPostRowsById(id);
  if (photoRows.length === 0) {
    return NextResponse.json({ message: "Photo not found." }, { status: 500 });
  }

  const [updatedPost] = await hydratePosts(photoRows);
  return NextResponse.json({ photo: updatedPost, post: updatedPost });
}

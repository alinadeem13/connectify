import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { getPostRowsById, hydratePosts, postExists } from "@/lib/photo";
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
  const pool = await getSqlPool();

  if (!(await postExists(id))) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  await pool
    .request()
    .input("id", sql.NVarChar(64), randomUUID())
    .input("text", sql.NVarChar(sql.MAX), parsed.data.text)
    .input("postId", sql.NVarChar(64), id)
    .input("userId", sql.NVarChar(64), user.id)
    .query("INSERT INTO dbo.comments (id, text, post_id, user_id) VALUES (@id, @text, @postId, @userId)");

  const photoRows = await getPostRowsById(id);
  if (photoRows.length === 0) {
    return NextResponse.json({ message: "Photo not found." }, { status: 500 });
  }

  const [updatedPost] = await hydratePosts(photoRows);
  return NextResponse.json({ photo: updatedPost, post: updatedPost });
}

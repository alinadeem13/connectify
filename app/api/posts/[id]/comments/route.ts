import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, writeDb } from "@/lib/db";

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
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ message: "Comment text is required." }, { status: 400 });
  }

  const { id } = await context.params;
  const db = await readDb();
  const post = db.posts.find((entry) => entry.id === id);

  if (!post) {
    return NextResponse.json({ message: "Post not found." }, { status: 404 });
  }

  post.comments.push({
    id: randomUUID(),
    author: user.name,
    text,
    createdAt: new Date().toISOString(),
  });

  await writeDb(db);
  return NextResponse.json({ post });
}

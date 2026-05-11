import { NextResponse } from "next/server";
import { getPostRowsById, hydratePosts } from "@/lib/photo";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await getPostRowsById(id);

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "Photo not found." }, { status: 404 });
  }

  const [post] = await hydratePosts(data);
  return NextResponse.json({ photo: post, post });
}

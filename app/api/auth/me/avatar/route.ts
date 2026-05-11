import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSqlPool, sql } from "@/lib/azure-sql";
import { uploadImageToAzure } from "@/lib/azure-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Profile image is required." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image files can be used as profile pictures." }, { status: 400 });
  }

  const upload = await uploadImageToAzure(file, "avatars");
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("userId", sql.NVarChar(64), user.id)
    .input("avatarUrl", sql.NVarChar(1000), upload.imageUrl)
    .input("avatarStoragePath", sql.NVarChar(1000), upload.storagePath)
    .query<{
      id: string;
      name: string;
      email: string;
      username: string;
      role: "creator" | "consumer";
      avatar_url: string | null;
      avatar_storage_path: string | null;
      created_at: Date;
    }>(`
      UPDATE dbo.users
      SET avatar_url = @avatarUrl, avatar_storage_path = @avatarStoragePath
      OUTPUT inserted.id, inserted.name, inserted.email, inserted.username, inserted.role, inserted.avatar_url, inserted.avatar_storage_path, inserted.created_at
      WHERE id = @userId
    `);

  const updatedUser = result.recordset[0];

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatar_url,
      avatarStoragePath: updatedUser.avatar_storage_path,
      createdAt: updatedUser.created_at.toISOString(),
    },
  });
}

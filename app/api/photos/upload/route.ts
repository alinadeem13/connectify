import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImageToAzure } from "@/lib/azure-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (user.role !== "creator") {
    return NextResponse.json({ message: "Only creators can upload photos." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image file is required." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image files can be uploaded." }, { status: 400 });
  }

  const upload = await uploadImageToAzure(file);
  return NextResponse.json(upload, { status: 201 });
}

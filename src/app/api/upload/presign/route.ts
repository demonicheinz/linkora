import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl, getPublicUrl } from "@/lib/r2";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "video/mp4",
];

const MAX_SIZES: Record<string, number> = {
  avatar: 10 * 1024 * 1024, // 10MB
  background: 50 * 1024 * 1024, // 50MB
  "background-video": 100 * 1024 * 1024, // 100MB
  banner: 15 * 1024 * 1024, // 15MB
  thumbnail: 10 * 1024 * 1024, // 10MB
  logo: 10 * 1024 * 1024, // 10MB
  icon: 5 * 1024 * 1024, // 5MB
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileType, contentType, size } = body;

    if (!fileType || !contentType || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const maxSize = MAX_SIZES[fileType];
    if (!maxSize || size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Max size for ${fileType} is ${maxSize / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    const key = `${session.user.id}/${fileType}/${nanoid()}`;
    const presignedUrl = await getPresignedUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({ presignedUrl, publicUrl, key });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}

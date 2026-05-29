import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type ImageType, processImage } from "@/lib/image";
import { getPublicUrl, r2 } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as ImageType | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing file or type" },
        { status: 400 },
      );
    }

    // Process image with sharp if needed
    const buffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer =
      type === "avatar" ||
      type === "banner" ||
      type === "thumbnail" ||
      type === "background"
        ? await processImage(buffer, type)
        : buffer;

    // Upload to R2
    const key = `${session.user.id}/${type}/${nanoid()}.jpg`;
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: processedBuffer,
        ContentType: "image/jpeg",
      }),
    );

    const publicUrl = getPublicUrl(key);

    // For link-level thumbnail/icon, skip updating User record (Frontend will save it to the Link record)
    if (type === "thumbnail" || type === "icon") {
      return NextResponse.json({ url: publicUrl });
    }

    // Update user record
    const fieldMap: Record<ImageType, string> = {
      avatar: "avatarUrl",
      banner: "bannerUrl",
      background: "wallpaperImageUrl",
      // These are not user-level fields but we type-guard them above
      icon: "icon",
      thumbnail: "thumbnailUrl",
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { [fieldMap[type]]: publicUrl },
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Process upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}

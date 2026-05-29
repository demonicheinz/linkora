import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublicUrl, verifyFileExists } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, field } = body;

    if (!key || !field) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify file exists in R2
    const exists = await verifyFileExists(key);
    if (!exists) {
      return NextResponse.json(
        { error: "File not found in storage" },
        { status: 404 },
      );
    }

    // All fields (thumbnail, avatar, banner, background, background-video)
    // are updated explicitly by the frontend via PUT /api/user/me or PUT /api/links.
    // We only need to verify the file was successfully uploaded to R2.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm upload error:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 },
    );
  }
}

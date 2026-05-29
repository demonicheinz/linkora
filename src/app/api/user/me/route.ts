import bcrypt from "bcryptjs";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,

        // Profile display
        displayName: true,

        // Header
        headerLayout: true,
        avatarShape: true,

        // Theme
        theme: true,

        // Wallpaper
        wallpaperStyle: true,
        wallpaperColor: true,
        wallpaperGradient: true,
        gradientDirection: true,
        gradientNoise: true,
        wallpaperPattern: true,
        wallpaperImageUrl: true,
        wallpaperVideoUrl: true,
        videoCropX: true,
        videoCropY: true,
        videoCropWidth: true,
        videoCropHeight: true,
        wallpaperBlur: true,
        imageEffect: true,
        imageTint: true,
        videoTint: true,

        // Text
        pageFontFamily: true,
        pageTextColor: true,
        altTitleFont: true,
        titleFontFamily: true,
        titleColor: true,
        bioColor: true,

        // Button
        buttonStyle: true,
        buttonShadow: true,
        buttonCorner: true,
        buttonColor: true,
        buttonTextColor: true,
        buttonShadowColor: true,

        // Footer
        hideFooter: true,
        customFooterText: true,
        customFooterUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),

  // Profile display
  displayName: z.string().optional().nullable(),

  // Header
  headerLayout: z.string().optional(),
  avatarShape: z.string().optional(),

  // Theme
  theme: z.string().optional(),

  // Wallpaper
  wallpaperStyle: z.string().optional(),
  wallpaperColor: z.string().optional(),
  wallpaperGradient: z.string().optional(),
  gradientDirection: z.string().optional(),
  gradientNoise: z.boolean().optional(),
  wallpaperPattern: z.string().optional(),
  wallpaperImageUrl: z.string().url().optional().nullable(),
  wallpaperVideoUrl: z.string().url().optional().nullable(),
  videoCropX: z.number().optional().nullable(),
  videoCropY: z.number().optional().nullable(),
  videoCropWidth: z.number().optional().nullable(),
  videoCropHeight: z.number().optional().nullable(),
  wallpaperBlur: z.number().int().min(0).max(100).optional(),
  imageEffect: z.string().optional(),
  imageTint: z.number().int().min(0).max(100).optional(),
  videoTint: z.number().int().min(0).max(100).optional(),

  // Text
  pageFontFamily: z.string().optional(),
  pageTextColor: z.string().optional(),
  altTitleFont: z.boolean().optional(),
  titleFontFamily: z.string().optional(),
  titleColor: z.string().optional(),
  bioColor: z.string().optional(),

  // Button
  buttonStyle: z.string().optional(),
  buttonShadow: z.string().optional(),
  buttonCorner: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  buttonShadowColor: z.string().optional(),

  // Footer
  hideFooter: z.boolean().optional(),
  customFooterText: z.string().optional(),
  customFooterUrl: z.string().optional(),
});

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updateData = { ...validated };

    // Unique email check if email is being updated
    if (validated.email) {
      const existing = await prisma.user.findUnique({
        where: { email: validated.email },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email is already in use by another account" },
          { status: 400 },
        );
      }
    }

    // Securely hash password if provided
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        displayName: true,
        headerLayout: true,
        avatarShape: true,
        theme: true,
        wallpaperStyle: true,
        wallpaperColor: true,
        wallpaperGradient: true,
        gradientDirection: true,
        gradientNoise: true,
        wallpaperPattern: true,
        wallpaperImageUrl: true,
        wallpaperVideoUrl: true,
        wallpaperBlur: true,
        imageEffect: true,
        imageTint: true,
        videoTint: true,
        pageFontFamily: true,
        pageTextColor: true,
        altTitleFont: true,
        titleFontFamily: true,
        titleColor: true,
        bioColor: true,
        buttonStyle: true,
        buttonShadow: true,
        buttonCorner: true,
        buttonColor: true,
        buttonTextColor: true,
        buttonShadowColor: true,
        hideFooter: true,
        customFooterText: true,
        customFooterUrl: true,
      },
    });

    revalidateTag("public-page", "max");

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

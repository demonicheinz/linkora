import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const updateLinkSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  icon: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  color: z.string().optional(),
  type: z.string().optional(),
  isActive: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const link = await prisma.link.findFirst({
      where: { id, userId: session.user.id },
      include: { _count: { select: { clicks: true } } },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("Get link error:", error);
    return NextResponse.json({ error: "Failed to get link" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateLinkSchema.parse(body);

    const link = await prisma.link.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const updated = await prisma.link.update({
      where: { id },
      data: validated,
    });

    revalidateTag("public-page", "max");

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Update link error:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const link = await prisma.link.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await prisma.link.delete({ where: { id } });

    revalidateTag("public-page", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 },
    );
  }
}

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL"),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.string().default("url"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isPinned: "desc" }, { order: "asc" }],
      include: {
        _count: { select: { clicks: true } },
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json({ error: "Failed to get links" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = linkSchema.parse(body);

    // Get max order
    const maxOrder = await prisma.link.aggregate({
      where: { userId: session.user.id },
      _max: { order: true },
    });

    const link = await prisma.link.create({
      data: {
        ...validated,
        userId: session.user.id,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    revalidateTag("public-page", "max");

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Create link error:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 },
    );
  }
}

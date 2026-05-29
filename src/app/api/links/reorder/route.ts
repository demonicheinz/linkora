import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const reorderSchema = z.object({
  orderedIds: z.array(z.string()),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderedIds } = reorderSchema.parse(body);

    // Update all links with new order
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.link.updateMany({
          where: { id, userId: session.user.id },
          data: { order: index },
        }),
      ),
    );

    revalidateTag("public-page", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Reorder links error:", error);
    return NextResponse.json(
      { error: "Failed to reorder links" },
      { status: 500 },
    );
  }
}

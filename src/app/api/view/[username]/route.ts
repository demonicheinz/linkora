import { type NextRequest, NextResponse, userAgent } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const body = request.json ? await request.json() : {};

    // 1. Resolve user ID by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Extract device info from request headers
    const { device: uaDevice, browser } = userAgent(request);
    const device = uaDevice.type === "mobile" ? "mobile" : "desktop";
    const browserName = browser.name || null;
    const country = request.headers.get("x-vercel-ip-country") || null;
    const referrer = body.referrer || request.headers.get("referer") || null;

    // 3. Create view record
    const view = await prisma.view.create({
      data: {
        userId: user.id,
        device,
        browser: browserName,
        country,
        referrer,
      },
    });

    return NextResponse.json({
      success: true,
      viewId: view.id,
    });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 },
    );
  }
}

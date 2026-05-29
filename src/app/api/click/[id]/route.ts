import crypto from "node:crypto";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = request.json ? await request.json() : {};

    // Extract device info from headers
    const { device: uaDevice, browser, os } = userAgent(request);
    const device = uaDevice.type === "mobile" ? "mobile" : "desktop";
    const browserName = browser.name || body.browser || null;
    const osName = os.name || null;

    const country =
      request.headers.get("x-vercel-ip-country") || body.country || null;
    const city = request.headers.get("x-vercel-ip-city") || null;
    const referrer = body.referrer || request.headers.get("referer") || null;

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;
    const ipHash = ip
      ? crypto.createHash("sha256").update(ip).digest("hex")
      : null;

    // Create click record
    const click = await prisma.click.create({
      data: {
        linkId: id,
        device,
        browser: browserName,
        os: osName,
        country,
        city,
        referrer,
        ipHash,
      },
    });

    // Get the link URL for redirect
    const link = await prisma.link.findUnique({
      where: { id },
      select: { url: true },
    });

    return NextResponse.json({
      success: true,
      clickId: click.id,
      redirectUrl: link?.url,
    });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 },
    );
  }
}

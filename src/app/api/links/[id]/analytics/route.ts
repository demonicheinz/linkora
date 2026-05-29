import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: linkId } = await params;

    // Verify the link belongs to the user
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: session.user.id },
    });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    let daysToSubtract = 7;
    if (range === "30d" || range === "Last 30 days") daysToSubtract = 30;
    else if (range === "90d" || range === "Last 90 days") daysToSubtract = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    // 1. Daily click aggregates for this link
    const dailyClicks = await prisma.$queryRaw<
      { date: string; desktop: number; mobile: number }[]
    >`
      SELECT
        DATE("clickedAt") as date,
        COUNT(*) FILTER (WHERE device = 'desktop' OR device IS NULL) as desktop,
        COUNT(*) FILTER (WHERE device = 'mobile' OR device = 'tablet') as mobile
      FROM "Click"
      WHERE "linkId" = ${linkId}
      AND "clickedAt" >= ${startDate}
      GROUP BY DATE("clickedAt")
      ORDER BY date ASC
    `;

    // 2. Top Locations for this link
    const topLocations = await prisma.click.groupBy({
      by: ["country"],
      where: {
        linkId: linkId,
        clickedAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // 3. Top Referrers for this link
    const topReferrers = await prisma.click.groupBy({
      by: ["referrer"],
      where: {
        linkId: linkId,
        clickedAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // 4. Devices for this link
    const devices = await prisma.click.groupBy({
      by: ["device"],
      where: {
        linkId: linkId,
        clickedAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Format daily clicks for chart
    const formattedDailyClicks = dailyClicks.map((d) => ({
      date:
        typeof d.date === "string"
          ? d.date
          : new Date(d.date).toISOString().split("T")[0],
      desktop: Number(d.desktop),
      mobile: Number(d.mobile),
    }));

    return NextResponse.json({
      dailyClicks: formattedDailyClicks,
      topLocations: topLocations.map((loc) => ({
        country: loc.country || "Unknown",
        clicks: loc._count.id,
      })),
      topReferrers: topReferrers.map((ref) => ({
        referrer: ref.referrer || "Direct",
        clicks: ref._count.id,
      })),
      devices: devices.map((dev) => ({
        device: dev.device || "Unknown",
        clicks: dev._count.id,
      })),
    });
  } catch (error) {
    console.error("Link analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch link analytics" },
      { status: 500 },
    );
  }
}

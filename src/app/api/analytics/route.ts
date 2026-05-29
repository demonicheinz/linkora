import { connection, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  // Call connection() and auth() outside of try/catch so Next.js's internal
  // prerender bailout exceptions can propagate without being swallowed.
  await connection();
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "Last 28 days";

    let daysToSubtract = 28;
    if (range === "7d" || range === "Last 7 days") daysToSubtract = 7;
    else if (range === "28d" || range === "Last 28 days") daysToSubtract = 28;
    else if (
      range === "90d" ||
      range === "Last 90 days" ||
      range === "Last 3 months"
    )
      daysToSubtract = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    // Daily click aggregates
    const dailyClicks = await prisma.$queryRaw<
      { date: string; desktop: number; mobile: number }[]
    >`
      SELECT
        DATE("clickedAt") as date,
        COUNT(*) FILTER (WHERE device = 'desktop' OR device IS NULL) as desktop,
        COUNT(*) FILTER (WHERE device = 'mobile' OR device = 'tablet') as mobile
      FROM "Click"
      WHERE "linkId" IN (
        SELECT id FROM "Link" WHERE "userId" = ${session.user.id}
      )
      AND "clickedAt" >= ${startDate}
      GROUP BY DATE("clickedAt")
      ORDER BY date ASC
    `;

    // Daily view aggregates
    const dailyViews = await prisma.$queryRaw<
      { date: string; desktop: number; mobile: number }[]
    >`
      SELECT
        DATE("viewedAt") as date,
        COUNT(*) FILTER (WHERE device = 'desktop' OR device IS NULL) as desktop,
        COUNT(*) FILTER (WHERE device = 'mobile' OR device = 'tablet') as mobile
      FROM "View"
      WHERE "userId" = ${session.user.id}
      AND "viewedAt" >= ${startDate}
      GROUP BY DATE("viewedAt")
      ORDER BY date ASC
    `;

    // Per-link stats
    const linkStats = await prisma.link.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        title: true,
        url: true,
        isActive: true,
        _count: { select: { clicks: true } },
        clicks: {
          where: { clickedAt: { gte: startDate } },
          select: { id: true },
        },
      },
      orderBy: { order: "asc" },
    });

    const formattedLinkStats = linkStats.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      isActive: link.isActive,
      totalClicks: link._count.clicks,
      periodClicks: link.clicks.length,
    }));

    // Format daily clicks for the chart
    const formattedDailyClicks = dailyClicks.map((d) => ({
      date:
        typeof d.date === "string"
          ? d.date
          : new Date(d.date).toISOString().split("T")[0],
      desktop: Number(d.desktop),
      mobile: Number(d.mobile),
    }));

    // Format daily views for the chart
    const formattedDailyViews = dailyViews.map((d) => ({
      date:
        typeof d.date === "string"
          ? d.date
          : new Date(d.date).toISOString().split("T")[0],
      desktop: Number(d.desktop),
      mobile: Number(d.mobile),
    }));

    return NextResponse.json({
      dailyClicks: formattedDailyClicks,
      dailyViews: formattedDailyViews,
      linkStats: formattedLinkStats,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

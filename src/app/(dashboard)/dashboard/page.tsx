import { Suspense } from "react";
import { DashboardRecentLinks } from "@/app/(dashboard)/dashboard/recent-links";
import { SectionCards } from "@/components/dashboard/section-cards";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getDashboardStats(userId: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalLinks,
    activeLinks,
    totalClicks,
    monthClicks,
    prevMonthClicks,
    totalViews,
    monthViews,
    prevMonthViews,
    recentLinks,
  ] = await Promise.all([
    prisma.link.count({ where: { userId } }),
    prisma.link.count({ where: { userId, isActive: true } }),
    prisma.click.count({
      where: { link: { userId } },
    }),
    prisma.click.count({
      where: {
        link: { userId },
        clickedAt: { gte: thisMonthStart },
      },
    }),
    prisma.click.count({
      where: {
        link: { userId },
        clickedAt: { gte: prevMonthStart, lt: thisMonthStart },
      },
    }),
    prisma.view.count({ where: { userId } }),
    prisma.view.count({
      where: {
        userId,
        viewedAt: { gte: thisMonthStart },
      },
    }),
    prisma.view.count({
      where: {
        userId,
        viewedAt: { gte: prevMonthStart, lt: thisMonthStart },
      },
    }),
    prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { clicks: true } } },
    }),
  ]);

  return {
    totalLinks,
    activeLinks,
    totalClicks,
    monthClicks,
    prevMonthClicks,
    totalViews,
    monthViews,
    prevMonthViews,
    recentLinks,
  };
}

// Inner component: auth() runs inside Suspense boundary
async function DashboardContent() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6 overflow-y-auto h-full">
      <div>
        <SectionCards
          totalLinks={stats.totalLinks}
          totalClicks={stats.totalClicks}
          monthClicks={stats.monthClicks}
          activeLinks={stats.activeLinks}
          prevMonthClicks={stats.prevMonthClicks}
          totalViews={stats.totalViews}
          monthViews={stats.monthViews}
          prevMonthViews={stats.prevMonthViews}
        />
      </div>
      <div className="px-4 lg:px-6 pb-6">
        <DashboardRecentLinks links={stats.recentLinks} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
